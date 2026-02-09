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

// Search QuranPedia for fatwas
const searchQuranPedia = async (question: string): Promise<any[]> => {
  try {
    const searchUrl = `https://api.quranpedia.net/v1/search/${encodeURIComponent(question)}/fatwas`;
    console.log("Searching QuranPedia:", searchUrl);
    
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("QuranPedia returned status:", response.status);
      return [];
    }

    const data = await response.json();
    console.log("QuranPedia results:", data?.data?.length || 0);
    
    return data?.data || [];
  } catch (error) {
    console.error("QuranPedia error:", error);
    return [];
  }
};

// Search Mofeed API
const searchMofeed = async (question: string): Promise<any[]> => {
  try {
    const searchUrl = `https://content.mofeed.org/Api/content?language=1&search=${encodeURIComponent(question)}`;
    console.log("Searching Mofeed:", searchUrl);
    
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("Mofeed returned status:", response.status);
      return [];
    }

    const data = await response.json();
    console.log("Mofeed results:", data?.data?.length || 0);
    
    return data?.data || [];
  } catch (error) {
    console.error("Mofeed error:", error);
    return [];
  }
};

// Process QuranPedia fatwa result
const processQuranPediaResult = (item: any, keywords: string[]): { content: string; score: number; source: string; evidence?: string } => {
  const title = cleanText(item.title || item.ar_title);
  const content = cleanText(item.content || item.ar_content || item.answer || item.ar_answer);
  const mufti = cleanText(item.mufti || item.ar_mufti);
  const sourceUrl = item.ar_source_url || item.source_url || "";
  
  // Calculate relevance score
  const text = `${title} ${content}`.toLowerCase();
  let score = content.length * 2; // Prioritize longer content
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 15;
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 25;
      }
    }
  }
  
  // QuranPedia fatwas get bonus for being text-focused
  score += 100;
  
  let sourceName = "QuranPedia";
  if (sourceUrl.includes("islamweb")) sourceName = "إسلام ويب";
  else if (sourceUrl.includes("islamqa")) sourceName = "إسلام سؤال وجواب";
  
  return {
    content: content || title,
    score,
    source: `المصدر: ${sourceName}${mufti ? ` | ${mufti}` : ""}`,
    evidence: title !== content ? title : undefined,
  };
};

// Process Mofeed result
const processMofeedResult = (item: any, keywords: string[]): { content: string; score: number; source: string; evidence?: string; note?: string } => {
  const description = cleanText(item.description);
  const notes = cleanText(item.notes);
  const articleContent = cleanText(item.article?.content || item.article?.body);
  const name = cleanText(item.name);
  
  // Get best content
  let content = "";
  let contentScore = 0;
  
  if (articleContent && articleContent.length > 50) {
    content = articleContent;
    contentScore = articleContent.length * 3;
  } else if (description && description.length > 50) {
    content = description;
    contentScore = description.length * 2;
  } else if (notes && notes.length > 50) {
    content = notes;
    contentScore = notes.length;
  } else {
    content = name;
    contentScore = name.length * 0.5;
  }
  
  // Calculate relevance score
  const text = `${name} ${description} ${notes}`.toLowerCase();
  let score = contentScore;
  
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
      if (name.toLowerCase().includes(keyword.toLowerCase())) {
        score += 20;
      }
    }
  }
  
  // Get source info
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
  
  const categoryName = item.categories?.[0]?.name || "";
  
  return {
    content,
    score,
    source: `المصدر: ${sourceName}${authorName ? ` | ${authorName}` : ""}${categoryName ? ` | ${categoryName}` : ""}`,
    evidence: description && description !== content ? description.substring(0, 400) : undefined,
    note: notes && notes !== content ? notes.substring(0, 300) : undefined,
  };
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
    
    // Extract keywords for relevance scoring
    const keywords = question
      .replace(/[؟?!.,،]/g, '')
      .split(/\s+/)
      .filter((word: string) => word.length > 2);

    // Search both sources in parallel
    const [quranPediaResults, mofeedResults] = await Promise.all([
      searchQuranPedia(question),
      searchMofeed(question),
    ]);

    // Process and score all results
    const allResults: Array<{ content: string; score: number; source: string; evidence?: string; note?: string }> = [];

    // Process QuranPedia results
    for (const item of quranPediaResults.slice(0, 5)) {
      const processed = processQuranPediaResult(item, keywords);
      if (processed.content.length > 20) {
        allResults.push(processed);
      }
    }

    // Process Mofeed results
    for (const item of mofeedResults.slice(0, 5)) {
      const processed = processMofeedResult(item, keywords);
      if (processed.content.length > 20) {
        allResults.push(processed);
      }
    }

    console.log("Total processed results:", allResults.length);

    let result: SearchResult;

    if (allResults.length > 0) {
      // Sort by score and get best result
      allResults.sort((a, b) => b.score - a.score);
      const best = allResults[0];
      
      console.log("Best result score:", best.score, "Content length:", best.content.length);

      // Limit answer length
      let answer = best.content;
      if (answer.length > 1500) {
        answer = answer.substring(0, 1500) + "...";
      }

      result = {
        answer,
        source: best.source,
        evidence: best.evidence,
        note: best.note,
      };
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
