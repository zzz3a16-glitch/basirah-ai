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

serve(async (req) => {
  // Handle CORS preflight
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

    // Query the Mofeed Content API
    const mofeedUrl = `https://content.mofeed.org/Api/content?language=1&search=${encodeURIComponent(question)}`;

    const mofeedResponse = await fetch(mofeedUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!mofeedResponse.ok) {
      console.error("Mofeed API error:", mofeedResponse.status);
      return new Response(
        JSON.stringify({
          result: {
            answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mofeedData = await mofeedResponse.json();
    console.log("Mofeed data count:", mofeedData?.data?.length || 0);

    // Process results
    let result: SearchResult;

    if (mofeedData && mofeedData.data && Array.isArray(mofeedData.data) && mofeedData.data.length > 0) {
      // Clean HTML from content
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

      // Find the best result - prioritize ones with textual content
      let bestResult = null;
      let bestScore = 0;
      
      for (const item of mofeedData.data) {
        let score = 0;
        
        // Check for textual content
        const desc = cleanText(item.description);
        const notes = cleanText(item.notes);
        const articleContent = cleanText(item.article?.content || item.article?.body);
        
        score += desc.length;
        score += notes.length;
        score += articleContent.length * 2; // Prioritize article content
        
        // Also consider author bio if no other content
        const authorBio = item.author?.[0]?.bio ? cleanText(item.author[0].bio) : "";
        if (score === 0 && authorBio.length > 0) {
          score += 1; // Small score for having author info
        }
        
        if (score > bestScore || !bestResult) {
          bestScore = score;
          bestResult = item;
        }
      }
      
      const topResult = bestResult || mofeedData.data[0];
      
      // Extract content
      const name = cleanText(topResult.name);
      const description = cleanText(topResult.description);
      const notes = cleanText(topResult.notes);
      const articleContent = cleanText(topResult.article?.content || topResult.article?.body);
      
      // Get author info
      let authorName = "";
      let authorBio = "";
      if (topResult.author && Array.isArray(topResult.author) && topResult.author.length > 0) {
        authorName = topResult.author[0].name || "";
        authorBio = cleanText(topResult.author[0].bio);
      }
      
      // Get category info
      let categoryName = "";
      if (topResult.categories && Array.isArray(topResult.categories) && topResult.categories.length > 0) {
        categoryName = topResult.categories[0].name || "";
      }
      
      // Get entity/source info
      let sourceName = "منصة مفيد";
      if (topResult.entity) {
        if (typeof topResult.entity === "string") {
          sourceName = topResult.entity;
        } else if (topResult.entity.name) {
          sourceName = topResult.entity.name;
        }
      }

      // Build the answer from available content
      let answerText = "";
      
      // Priority: article > description > notes > name with context
      if (articleContent && articleContent.length > 30) {
        answerText = articleContent;
      } else if (description && description.length > 30) {
        answerText = description;
      } else if (notes && notes.length > 30) {
        answerText = notes;
      } else {
        // Use name with author context
        if (name) {
          answerText = `${name}`;
          if (categoryName) {
            answerText += ` - ${categoryName}`;
          }
          if (authorName) {
            answerText += `\n\nمن محتوى الشيخ ${authorName}`;
          }
          
          // Add a note about the content type
          const hasVideo = topResult.video && topResult.video !== "[]";
          const hasAudio = topResult.audio && topResult.audio !== "[]";
          
          if (hasVideo || hasAudio) {
            answerText += `\n\nللمزيد من التفاصيل، يُرجى مشاهدة ${hasVideo ? "الفيديو" : "الصوتية"} المتاحة على منصة مفيد.`;
          }
        }
      }
      
      if (!answerText || answerText.length < 5) {
        result = {
          answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
        };
      } else {
        result = {
          answer: answerText.substring(0, 2000),
          source: `المصدر: ${sourceName}${authorName ? ` - ${authorName}` : ""}`,
        };

        // Add relevant note if available
        if (notes && notes.length > 5 && !answerText.includes(notes)) {
          result.note = notes.substring(0, 500);
        }
        
        // Add author bio as evidence/reference if no other content
        if (!articleContent && !description && authorBio && authorBio.length > 50) {
          result.evidence = `عن الشيخ: ${authorBio.substring(0, 300)}`;
        }
      }
    } else {
      // No results - return mandatory disclaimer
      result = {
        answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
      };
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in islamic-search function:", error);
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