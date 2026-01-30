import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchResult {
  answer: string;
  evidence?: string;
  source?: string;
  note?: string;
}

// Clean HTML tags and entities from text
const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

// Extract meaningful content from API item
const extractContent = (item: any): { content: string; score: number } => {
  const description = cleanText(item.description);
  const notes = cleanText(item.notes);
  const articleContent = cleanText(item.article?.content || item.article?.body);
  const name = cleanText(item.name);
  
  // Priority: article content > description > notes
  if (articleContent && articleContent.length > 50) {
    return { content: articleContent, score: articleContent.length * 3 };
  }
  if (description && description.length > 50) {
    return { content: description, score: description.length * 2 };
  }
  if (notes && notes.length > 50) {
    return { content: notes, score: notes.length };
  }
  
  return { content: name, score: name.length * 0.5 };
};

// Get author and source info
const getSourceInfo = (item: any): { authorName: string; sourceName: string } => {
  let authorName = "";
  let sourceName = "منصة مفيد";
  
  if (item.author && Array.isArray(item.author) && item.author.length > 0) {
    authorName = item.author[0].name || "";
  }
  
  if (item.entity) {
    if (typeof item.entity === "string") {
      sourceName = item.entity;
    } else if (item.entity.name) {
      sourceName = item.entity.name;
    }
  }
  
  return { authorName, sourceName };
};

// Calculate relevance score based on keyword matching
const calculateRelevance = (item: any, keywords: string[]): number => {
  const text = `${cleanText(item.name)} ${cleanText(item.description)} ${cleanText(item.notes)}`.toLowerCase();
  let score = 0;
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
      // Bonus for keyword in title
      if (cleanText(item.name).toLowerCase().includes(keyword.toLowerCase())) {
        score += 20;
      }
    }
  }
  
  return score;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Searching for:", question);
    
    // Extract keywords from question for relevance scoring
    const keywords = question
      .replace(/[؟?!.,،]/g, '')
      .split(/\s+/)
      .filter((word: string) => word.length > 2);

    // Try specific search first
    const searchUrl = `https://content.mofeed.org/Api/content?language=1&search=${encodeURIComponent(question)}`;
    
    console.log("Fetching from:", searchUrl);
    
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("API error:", response.status);
      return new Response(
        JSON.stringify({
          result: {
            answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Results count:", data?.data?.length || 0);

    let result: SearchResult;

    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Score and sort results by relevance and content quality
      const scoredResults = data.data.map((item: any) => {
        const { content, score: contentScore } = extractContent(item);
        const relevanceScore = calculateRelevance(item, keywords);
        return {
          item,
          content,
          totalScore: contentScore + relevanceScore,
        };
      });

      // Sort by score descending
      scoredResults.sort((a: any, b: any) => b.totalScore - a.totalScore);
      
      // Get best result
      const best = scoredResults[0];
      const bestItem = best.item;
      const bestContent = best.content;
      
      console.log("Best result score:", best.totalScore, "Content length:", bestContent.length);

      if (bestContent.length < 20) {
        // No meaningful content found
        result = {
          answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
        };
      } else {
        const { authorName, sourceName } = getSourceInfo(bestItem);
        const categoryName = bestItem.categories?.[0]?.name || "";
        
        // Build answer
        let answer = bestContent;
        
        // If content is just a title, add context
        if (answer.length < 100 && cleanText(bestItem.name) === answer) {
          const hasMedia = (bestItem.video && bestItem.video !== "[]") || 
                          (bestItem.audio && bestItem.audio !== "[]");
          
          if (hasMedia) {
            answer += "\n\nللمزيد من التفاصيل، يمكنكم الرجوع إلى المحتوى المرئي أو الصوتي المتاح على منصة مفيد.";
          }
        }
        
        // Limit answer length
        if (answer.length > 1500) {
          answer = answer.substring(0, 1500) + "...";
        }

        result = {
          answer,
          source: `المصدر: ${sourceName}${authorName ? ` | ${authorName}` : ""}${categoryName ? ` | ${categoryName}` : ""}`,
        };

        // Add note if available and different from answer
        const notes = cleanText(bestItem.notes);
        if (notes && notes.length > 20 && !answer.includes(notes)) {
          result.note = notes.substring(0, 300);
        }

        // Add evidence if we have article content and description is different
        const desc = cleanText(bestItem.description);
        if (desc && desc.length > 30 && !answer.includes(desc) && answer !== desc) {
          result.evidence = desc.substring(0, 400);
        }
      }
    } else {
      result = {
        answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
      };
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        result: {
          answer: "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.",
        }
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
