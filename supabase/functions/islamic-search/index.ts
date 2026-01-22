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
    const mofeedParams = new URLSearchParams({
      "language": "1", // Arabic
      "search": question,
    });

    const mofeedUrl = `https://content.mofeed.org/Api/content?${mofeedParams.toString()}`;

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
      // Log the first result in detail
      const firstItem = mofeedData.data[0];
      console.log("First result name:", firstItem.name);
      console.log("First result description:", firstItem.description);
      console.log("First result notes:", firstItem.notes);
      console.log("First result article:", JSON.stringify(firstItem.article || null));
      
      // Find the best result - look for one with the most content
      let bestResult = firstItem;
      let bestContentLength = 0;
      
      for (const item of mofeedData.data) {
        // Check article content too
        const articleContent = item.article?.content || item.article?.body || "";
        const contentLength = (item.description?.length || 0) + (item.notes?.length || 0) + (articleContent.length || 0);
        if (contentLength > bestContentLength) {
          bestContentLength = contentLength;
          bestResult = item;
        }
      }
      
      const topResult = bestResult;
      
      // Extract content based on the actual API structure
      const name = topResult.name || "";
      const description = topResult.description || "";
      const notes = topResult.notes || "";
      const articleContent = topResult.article?.content || topResult.article?.body || "";
      
      // Get author info
      let authorName = "";
      if (topResult.author) {
        if (typeof topResult.author === "string") {
          authorName = topResult.author;
        } else if (topResult.author.name) {
          authorName = topResult.author.name;
        }
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

      // Clean HTML from content if present
      const cleanText = (text: string) => {
        if (!text) return "";
        return text
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim();
      };

      // Build the answer from best available source
      const cleanName = cleanText(name);
      const cleanDescription = cleanText(description);
      const cleanNotes = cleanText(notes);
      const cleanArticle = cleanText(articleContent);
      
      // Construct answer - use article content if available (longest), then description, then name
      let answerText = "";
      if (cleanArticle && cleanArticle.length > 50) {
        answerText = cleanArticle;
      } else if (cleanDescription && cleanDescription.length > 50) {
        answerText = cleanDescription;
      } else if (cleanNotes && cleanNotes.length > 50) {
        answerText = cleanNotes;
      } else {
        // Combine what we have
        const combined = [cleanDescription, cleanNotes].filter(t => t && t.length > 0).join(". ");
        if (combined.length > 10) {
          answerText = combined;
        } else if (cleanName) {
          answerText = cleanName;
        } else {
          answerText = "لم يتم العثور على محتوى مفصل.";
        }
      }

      // If answer is still very short, add the title as context
      if (answerText.length < 50 && cleanName && !answerText.includes(cleanName)) {
        answerText = `${cleanName}: ${answerText}`;
      }
      
      result = {
        answer: answerText.substring(0, 2000),
        source: `المصدر: ${sourceName}${authorName ? ` - ${authorName}` : ""}`,
      };

      // Add notes as additional benefit if we didn't use it as main answer
      if (cleanNotes && cleanNotes.length > 5 && !answerText.includes(cleanNotes)) {
        result.note = cleanNotes.substring(0, 500);
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
