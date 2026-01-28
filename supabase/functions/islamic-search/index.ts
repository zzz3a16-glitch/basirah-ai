import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchResult {
  fatwaTitle?: string;
  answer: string;
  source?: string;
  evidence?: string;
  hadith?: string;
  audioUrl?: string;
}

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
            answer: "لم يتم العثور على إجابة لهذا السؤال. يرجى إعادة صياغة السؤال.",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mofeedData = await mofeedResponse.json();
    console.log("Results count:", mofeedData?.data?.length || 0);

    // Clean HTML and extract text
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

    // Extract audio URL from video/audio JSON
    const extractAudioUrl = (item: any): string => {
      // Try audio first
      if (item.audio && typeof item.audio === "string" && item.audio !== "[]") {
        try {
          const audioData = JSON.parse(item.audio);
          if (Array.isArray(audioData) && audioData.length > 0 && audioData[0].download_link) {
            return `https://content.mofeed.org/${audioData[0].download_link}`;
          }
        } catch {
          console.log("Failed to parse audio data");
        }
      }
      
      // Fallback to video
      if (item.video && typeof item.video === "string" && item.video !== "[]") {
        try {
          const videoData = JSON.parse(item.video);
          if (Array.isArray(videoData) && videoData.length > 0 && videoData[0].download_link) {
            return `https://content.mofeed.org/${videoData[0].download_link}`;
          }
        } catch {
          console.log("Failed to parse video data");
        }
      }
      
      return "";
    };

    let result: SearchResult;

    if (mofeedData?.data?.length > 0) {
      // Score and rank results by relevance
      const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      
      const scoredResults = mofeedData.data.map((item: any) => {
        const name = cleanText(item.name).toLowerCase();
        const description = cleanText(item.description);
        const notes = cleanText(item.notes);
        const articleContent = cleanText(item.article?.content || item.article?.body);
        
        let score = 0;
        const fullText = `${name} ${description} ${notes} ${articleContent}`.toLowerCase();
        
        // Score based on keyword matches
        for (const word of questionWords) {
          if (name.includes(word)) score += 10;
          if (fullText.includes(word)) score += 5;
        }
        
        // Bonus for having actual content
        if (description.length > 50) score += 15;
        if (articleContent.length > 50) score += 20;
        if (notes.length > 30) score += 10;
        
        return { item, score, description, notes, articleContent };
      }).sort((a: any, b: any) => b.score - a.score);

      const best = scoredResults[0];
      const topResult = best.item;
      
      console.log("Best match:", cleanText(topResult.name), "Score:", best.score);

      // Extract all available fields
      const fatwaTitle = cleanText(topResult.name);
      
      // Build the answer - prioritize article content > description > notes
      let answerText = "";
      if (best.articleContent && best.articleContent.length > 30) {
        answerText = best.articleContent;
      } else if (best.description && best.description.length > 30) {
        answerText = best.description;
      } else if (best.notes && best.notes.length > 20) {
        answerText = best.notes;
      }

      // Get category as context if no text answer
      let categoryName = "";
      if (topResult.categories && Array.isArray(topResult.categories) && topResult.categories.length > 0) {
        categoryName = topResult.categories[0].name || "";
      }

      // Build source info
      let authorName = "";
      let authorBio = "";
      if (topResult.author && Array.isArray(topResult.author) && topResult.author.length > 0) {
        authorName = topResult.author[0].name || "";
        authorBio = cleanText(topResult.author[0].bio);
      }

      let entityName = "منصة مفيد";
      if (topResult.entity) {
        if (typeof topResult.entity === "string") {
          entityName = topResult.entity;
        } else if (topResult.entity.name) {
          entityName = topResult.entity.name;
        }
      }

      const sourceLine = authorName ? `${authorName} - ${entityName}` : entityName;

      // Extract audio/video URL
      const audioUrl = extractAudioUrl(topResult);

      // Build final response
      result = {
        fatwaTitle: fatwaTitle || undefined,
        answer: answerText.length > 10 
          ? answerText.substring(0, 2000) 
          : audioUrl 
            ? "للاستماع إلى الفتوى، يرجى تشغيل المقطع الصوتي أدناه."
            : categoryName 
              ? `هذا المحتوى يتعلق بـ: ${categoryName}`
              : "لم يتم العثور على نص مكتوب لهذه الفتوى.",
        source: sourceLine,
      };

      // Add audio URL if available
      if (audioUrl) {
        result.audioUrl = audioUrl;
      }

      // Add evidence/hadith from notes if it contains relevant keywords
      if (best.notes && best.notes.length > 10) {
        const notesLower = best.notes.toLowerCase();
        if (notesLower.includes("حديث") || notesLower.includes("رواه") || notesLower.includes("صحيح")) {
          result.hadith = best.notes.substring(0, 500);
        } else if (notesLower.includes("دليل") || notesLower.includes("آية") || notesLower.includes("قال الله")) {
          result.evidence = best.notes.substring(0, 500);
        }
      }

      // Add author bio as additional info
      if (authorBio && authorBio.length > 50 && !result.evidence) {
        result.evidence = `عن الشيخ: ${authorBio.substring(0, 400)}`;
      }

    } else {
      result = {
        answer: "لم يتم العثور على فتوى مطابقة لسؤالك. يرجى إعادة صياغة السؤال بكلمات مختلفة.",
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
