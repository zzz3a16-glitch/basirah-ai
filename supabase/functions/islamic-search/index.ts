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
  suggestedQuestion?: string;
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

// Process search results into context for AI
const processSearchResults = (quranPediaResults: any[], mofeedResults: any[]): string => {
  let context = "";
  
  // Process QuranPedia results
  for (const item of quranPediaResults.slice(0, 3)) {
    const title = cleanText(item.title || item.ar_title);
    const content = cleanText(item.content || item.ar_content || item.answer || item.ar_answer);
    const mufti = cleanText(item.mufti || item.ar_mufti);
    const sourceUrl = item.ar_source_url || item.source_url || "";
    
    let sourceName = "QuranPedia";
    if (sourceUrl.includes("islamweb")) sourceName = "إسلام ويب";
    else if (sourceUrl.includes("islamqa")) sourceName = "إسلام سؤال وجواب";
    
    if (content.length > 20) {
      context += `\n---\nالمصدر: ${sourceName}${mufti ? ` | ${mufti}` : ""}\nالعنوان: ${title}\nالمحتوى: ${content.substring(0, 1500)}\n`;
    }
  }
  
  // Process Mofeed results
  for (const item of mofeedResults.slice(0, 3)) {
    const description = cleanText(item.description);
    const articleContent = cleanText(item.article?.content || item.article?.body);
    const name = cleanText(item.name);
    
    let authorName = "";
    if (item.author && Array.isArray(item.author) && item.author.length > 0) {
      authorName = item.author[0].name || "";
    }
    
    const content = articleContent || description;
    
    if (content.length > 20) {
      context += `\n---\nالمصدر: منصة مفيد${authorName ? ` | ${authorName}` : ""}\nالعنوان: ${name}\nالمحتوى: ${content.substring(0, 1500)}\n`;
    }
  }
  
  return context;
};

// Generate AI response using Lovable AI Gateway
const generateAIResponse = async (question: string, context: string): Promise<SearchResult> => {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not found");
    throw new Error("AI configuration error");
  }

  const systemPrompt = `أنت مساعد إسلامي ذكي اسمك "بصيرة". مهمتك الإجابة على الأسئلة الشرعية والعبادية بدقة واعتدال.

القواعد الأساسية:
1. اعتمد فقط على المصادر الموثوقة المقدمة لك
2. اذكر مصدر كل إجابة بوضوح
3. إذا كان في المسألة خلاف فقهي: اذكر أن فيها خلاف واعرض الرأي الراجح باختصار
4. لا تصدر فتاوى خاصة أو حساسة، ووجّه المستخدم لسؤال عالم مختص عند الحاجة
5. استخدم لغة عربية فصيحة مبسطة، واضحة ورحيمة
6. لا تستخدم أحاديث ضعيفة إلا مع التنبيه على ضعفها
7. لا تجب عن أي سؤال يخالف الشريعة

تنسيق الإجابة (JSON):
{
  "answer": "الجواب المختصر والواضح",
  "evidence": "الدليل من القرآن أو السنة إن وُجد",
  "source": "اسم المصدر الذي استندت إليه",
  "note": "تنبيه مهم إن وُجد (مثل: هذه المسألة فيها خلاف، أو: يُستحسن سؤال عالم)",
  "suggestedQuestion": "سؤال مقترح للمتابعة مثل: هل تود معرفة المزيد عن شروط الصلاة؟"
}

إذا لم تجد إجابة في المصادر المقدمة:
{
  "answer": "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة. يُنصح بسؤال عالم شرعي مختص.",
  "note": "هذه المسألة تحتاج لفتوى خاصة من عالم مختص"
}`;

  const userPrompt = `السؤال: ${question}

المصادر المتاحة:
${context || "لا توجد مصادر متاحة لهذا السؤال"}

أجب على السؤال بناءً على المصادر المقدمة فقط. إذا لم تجد إجابة واضحة، اعترف بذلك.
أجب بتنسيق JSON فقط.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("Empty AI response");
    }

    console.log("AI Response:", aiResponse);

    // Parse JSON response
    let parsed: SearchResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                        aiResponse.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, aiResponse];
      const jsonString = jsonMatch[1] || aiResponse;
      parsed = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Fallback: use raw response as answer
      parsed = {
        answer: aiResponse,
      };
    }

    return parsed;
  } catch (error) {
    console.error("AI generation error:", error);
    throw error;
  }
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

    console.log("Processing question:", question);

    // Search both sources in parallel
    const [quranPediaResults, mofeedResults] = await Promise.all([
      searchQuranPedia(question),
      searchMofeed(question),
    ]);

    console.log("Found results - QuranPedia:", quranPediaResults.length, "Mofeed:", mofeedResults.length);

    // Process search results into context
    const context = processSearchResults(quranPediaResults, mofeedResults);

    // Generate AI response
    let result: SearchResult;
    
    try {
      result = await generateAIResponse(question, context);
    } catch (aiError) {
      console.error("AI error, falling back to search results:", aiError);
      
      // Fallback to best search result if AI fails
      if (quranPediaResults.length > 0) {
        const item = quranPediaResults[0];
        result = {
          answer: cleanText(item.content || item.ar_content || item.answer || item.ar_answer) || 
                  "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
          source: "QuranPedia",
        };
      } else if (mofeedResults.length > 0) {
        const item = mofeedResults[0];
        result = {
          answer: cleanText(item.description || item.article?.content) ||
                  "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
          source: "منصة مفيد",
        };
      } else {
        result = {
          answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
        };
      }
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
