import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, surahId, ayahNumber, tafseerId } = await req.json();

    if (action === "surah") {
      // Fetch surah ayahs from alquran.cloud
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar.alafasy`);
      if (!res.ok) throw new Error(`alquran.cloud error: ${res.status}`);
      const data = await res.json();

      // Also fetch text-only (uthmani script)
      const textRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`);
      const textData = textRes.ok ? await textRes.json() : null;

      const ayahs = data.data.ayahs.map((ayah: any, i: number) => ({
        number: ayah.numberInSurah,
        text: textData?.data?.ayahs?.[i]?.text || ayah.text,
        audio: ayah.audio,
        audioSecondary: ayah.audioSecondary,
        page: ayah.page,
        juz: ayah.juz,
        hizbQuarter: ayah.hizbQuarter,
      }));

      return new Response(JSON.stringify({
        surah: {
          number: data.data.number,
          name: data.data.name,
          englishName: data.data.englishName,
          revelationType: data.data.revelationType,
          numberOfAyahs: data.data.numberOfAyahs,
        },
        ayahs,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "tafseer") {
      // Fetch tafseer from quran-tafseer API
      // tafseerId: 1 = تفسير ابن كثير, 2 = تفسير الطبري, 3 = تفسير القرطبي, 4 = تفسير السعدي
      const tafseerIdToUse = tafseerId || 1;
      const res = await fetch(
        `http://api.quran-tafseer.com/tafseer/${tafseerIdToUse}/${surahId}/${ayahNumber}`
      );
      if (!res.ok) throw new Error(`quran-tafseer error: ${res.status}`);
      const data = await res.json();

      return new Response(JSON.stringify({
        tafseer: data.text,
        tafseerName: data.tafseer_name,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Quran API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
