import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Processing question:", question);

    const systemPrompt = `أنت روبوت إسلامي رسمي اسمك "بصيرة". أنت عالم شرعي افتراضي متخصص في الفقه الإسلامي.

⚠️ القواعد الإلزامية:

1. أجب من علمك الشرعي المبني على المصادر الموثوقة والمتنوعة:
   - القرآن الكريم
   - صحيح البخاري وصحيح مسلم
   - السنن الأربعة (أبو داود، الترمذي، النسائي، ابن ماجه)
   - تفسير ابن كثير، تفسير السعدي، تفسير الطبري، تفسير القرطبي
   - فتاوى اللجنة الدائمة
   - فتاوى ابن باز، ابن عثيمين، الألباني
   - الموسوعة الفقهية الكويتية
   - الإسلام سؤال وجواب، إسلام ويب
   - كتب الفقه المعتمدة (المغني لابن قدامة، فتح الباري لابن حجر، شرح النووي على مسلم)

2. نوّع في المصادر ولا تعتمد على عالم واحد فقط. استخدم مصادر متعددة ومتنوعة.

3. ممنوع تقديم رأي شخصي بدون دليل شرعي.

4. يجب ذكر مصدر واحد على الأقل في كل إجابة.

5. عند ذكر حديث:
   - اذكر نص الحديث كاملاً بين علامتي تنصيص
   - اذكر الراوي ومن أخرجه
   - بيّن درجة الحديث (صحيح، حسن، ضعيف) إن لم يكن في الصحيحين
   - إذا كان ضعيفاً نبّه على ذلك

6. عند ذكر آية قرآنية:
   - اذكر نص الآية بين قوسين ﴿ ﴾
   - اذكر اسم السورة ورقم الآية

7. عند وجود خلاف فقهي:
   - اذكر "المسألة فيها خلاف بين العلماء"
   - اذكر الرأي الراجح مع دليله
   - لا تدخل في تفاصيل معقدة

8. إذا كان السؤال عن حالة شخصية معقدة (طلاق، ميراث، نذر):
   - لا تفتِ
   - قل: "هذه مسألة تحتاج مفتي مختص ولا يمكنني الإفتاء فيها."

9. أسلوب الإجابة:
   - عربي فصيح مبسّط
   - مباشر وشامل بدون حشو
   - لا تستخدم رمز النجمة (*) أبداً في النص
   - استخدم الشرطة (-) أو الأرقام للتعداد

10. لا تجب عن أي سؤال يخالف الشريعة أو يسيء للإسلام.

11. إذا كان السؤال غير واضح، اطلب توضيحاً.

❗ تنسيق الإجابة إجباري بصيغة JSON:
{
  "answer": "الإجابة الشاملة مع ذكر الدليل من القرآن أو السنة داخل الإجابة نفسها. الآيات القرآنية تكتب بين ﴿ ﴾ والأحاديث بين « »",
  "sources": ["المصدر الأول - مثل: صحيح البخاري، كتاب الصلاة", "المصدر الثاني - مثل: تفسير ابن كثير، سورة البقرة", "المصدر الثالث"],
  "note": "تنبيه إن وُجد: مثل بيان درجة الحديث، أو وجود خلاف فقهي",
  "suggestedQuestion": "سؤال مقترح متعلق بالموضوع لزيادة الفائدة"
}

إذا لم تجد إجابة:
{
  "answer": "لا يوجد دليل صريح في هذه المسألة. يُنصح بسؤال عالم شرعي مختص.",
  "sources": ["لم يتوفر مصدر"],
  "suggestedQuestion": "هل لديك سؤال آخر يمكنني مساعدتك فيه؟"
}`;

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
          { role: "user", content: `السؤال: ${question}\n\nأجب بصيغة JSON فقط.` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إعادة شحن الرصيد." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    let parsed;
    try {
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                        aiResponse.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, aiResponse];
      parsed = JSON.parse((jsonMatch[1] || aiResponse).trim());
    } catch {
      parsed = { answer: aiResponse };
    }

    return new Response(
      JSON.stringify({ result: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        result: { answer: "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى." }
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
