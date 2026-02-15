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
    const { latitude, longitude, method } = await req.json();

    if (!latitude || !longitude) {
      return new Response(JSON.stringify({ error: "latitude and longitude are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // method: 4 = Umm Al-Qura, 2 = ISNA, 3 = MWL, 5 = Egyptian
    const calcMethod = method || 4;
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    // Fetch prayer times
    const timingsUrl = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=${calcMethod}`;
    const timingsRes = await fetch(timingsUrl);
    if (!timingsRes.ok) throw new Error(`Aladhan timings error: ${timingsRes.status}`);
    const timingsData = await timingsRes.json();

    // Fetch Hijri calendar info
    const hijriUrl = `https://api.aladhan.com/v1/gpidd/${dd}-${mm}-${yyyy}`;
    const hijriRes = await fetch(hijriUrl);
    const hijriData = hijriRes.ok ? await hijriRes.json() : null;

    const t = timingsData.data.timings;
    const d = timingsData.data.date;
    const meta = timingsData.data.meta;

    return new Response(JSON.stringify({
      timings: {
        Fajr: t.Fajr,
        Sunrise: t.Sunrise,
        Dhuhr: t.Dhuhr,
        Asr: t.Asr,
        Maghrib: t.Maghrib,
        Isha: t.Isha,
      },
      date: {
        gregorian: d.readable,
        hijri: d.hijri ? {
          day: d.hijri.day,
          month: d.hijri.month.ar,
          year: d.hijri.year,
          designation: d.hijri.designation.abbreviated,
          weekday: d.hijri.weekday.ar,
          full: `${d.hijri.day} ${d.hijri.month.ar} ${d.hijri.year}`,
        } : null,
        gregorianWeekday: d.gregorian?.weekday?.ar || null,
      },
      location: {
        timezone: meta.timezone,
        method: meta.method.name,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Prayer Times Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
