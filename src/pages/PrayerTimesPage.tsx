import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Sun, Sunrise, Sunset, Moon, CloudSun, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface DateInfo {
  gregorian: string;
  hijri: {
    day: string;
    month: string;
    year: string;
    designation: string;
    weekday: string;
    full: string;
  } | null;
  gregorianWeekday: string | null;
}

interface PrayerData {
  timings: PrayerTimings;
  date: DateInfo;
  location: {
    timezone: string;
    method: string;
  };
}

const prayerMeta: Record<string, { label: string; icon: typeof Sun }> = {
  Fajr: { label: "الفجر", icon: Sunrise },
  Sunrise: { label: "الشروق", icon: Sun },
  Dhuhr: { label: "الظهر", icon: CloudSun },
  Asr: { label: "العصر", icon: Sun },
  Maghrib: { label: "المغرب", icon: Sunset },
  Isha: { label: "العشاء", icon: Moon },
};

const PrayerTimesPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cityName, setCityName] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPrayerTimes = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("prayer-times", {
        body: { latitude: lat, longitude: lng },
      });
      if (fnError) throw fnError;
      setData(result);

      // Reverse geocode for city name
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          setCityName(geo.address?.city || geo.address?.town || geo.address?.state || null);
        }
      } catch { /* ignore geocoding errors */ }
    } catch (err: any) {
      setError(err.message || "حدث خطأ في جلب أوقات الصلاة");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // Fallback: Mecca coordinates
      fetchPrayerTimes(21.4225, 39.8262);
      setCityName("مكة المكرمة");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude),
      () => {
        // Fallback on denied
        fetchPrayerTimes(21.4225, 39.8262);
        setCityName("مكة المكرمة (افتراضي)");
      },
      { timeout: 10000 }
    );
  }, [fetchPrayerTimes]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Determine next prayer
  const getNextPrayer = (): string | null => {
    if (!data) return null;
    const now = currentTime;
    const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    for (const p of prayerOrder) {
      const [h, m] = data.timings[p as keyof PrayerTimings].split(":").map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(h, m, 0, 0);
      if (prayerDate > now) return p;
    }
    return "Fajr"; // After Isha, next is Fajr
  };

  const nextPrayer = getNextPrayer();

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "م" : "ص";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm">الرئيسية</span>
          </button>
          <h1 className="text-lg font-bold text-foreground">أوقات الصلاة</h1>
          <button onClick={requestLocation} className="text-muted-foreground hover:text-foreground transition-colors" title="تحديث الموقع">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">جارٍ تحديد موقعك...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={requestLocation} className="text-primary underline text-sm">إعادة المحاولة</button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Date & Location Card */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary-hover p-6 text-primary-foreground space-y-3">
              {/* Hijri Date */}
              {data.date.hijri && (
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.date.hijri.full}</p>
                  <p className="text-sm opacity-80">{data.date.hijri.weekday}</p>
                </div>
              )}

              {/* Gregorian */}
              <p className="text-center text-sm opacity-70">{data.date.gregorian}</p>

              {/* Clock */}
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 opacity-70" />
                <span className="text-xl font-mono tabular-nums">
                  {currentTime.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                </span>
              </div>

              {/* City */}
              {cityName && (
                <div className="flex items-center justify-center gap-1.5 text-sm opacity-80">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{cityName}</span>
                </div>
              )}
            </div>

            {/* Prayer Times List */}
            <div className="space-y-2">
              {Object.entries(data.timings).map(([key, time]) => {
                const meta = prayerMeta[key];
                if (!meta) return null;
                const Icon = meta.icon;
                const isNext = key === nextPrayer;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${
                      isNext
                        ? "bg-primary/10 border-primary/30 shadow-sm"
                        : "bg-card border-border/30 hover:border-border/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isNext ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isNext ? "text-primary" : "text-foreground"}`}>{meta.label}</p>
                        {isNext && <p className="text-[10px] text-primary/70">الصلاة القادمة</p>}
                      </div>
                    </div>
                    <p className={`text-lg font-mono tabular-nums ${isNext ? "text-primary font-bold" : "text-foreground"}`}>
                      {formatTime(time)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Method info */}
            <p className="text-center text-[11px] text-muted-foreground">
              طريقة الحساب: {data.location.method}
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default PrayerTimesPage;
