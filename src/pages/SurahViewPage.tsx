import { FC, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { surahs } from "@/data/quranSurahs";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, BookOpen, Copy, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Ayah {
  number: number;
  text: string;
  audio?: string;
  page?: number;
  juz?: number;
}

const TAFSEER_OPTIONS = [
  { id: 1, name: "تفسير ابن كثير" },
  { id: 2, name: "تفسير الطبري" },
  { id: 3, name: "تفسير القرطبي" },
  { id: 4, name: "تفسير السعدي" },
];

const SurahViewPage: FC = () => {
  const { surahId } = useParams<{ surahId: string }>();
  const navigate = useNavigate();
  const surahNum = parseInt(surahId || "1", 10);
  const surahInfo = surahs.find((s) => s.id === surahNum);

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tafseer state
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [tafseerText, setTafseerText] = useState<string>("");
  const [tafseerName, setTafseerName] = useState<string>("");
  const [tafseerLoading, setTafseerLoading] = useState(false);
  const [tafseerId, setTafseerId] = useState(1);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Fetch surah ayahs
  useEffect(() => {
    const fetchSurah = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("quran-api", {
          body: { action: "surah", surahId: surahNum },
        });
        if (fnError) throw fnError;
        setAyahs(data.ayahs || []);
      } catch (e: any) {
        console.error("Error fetching surah:", e);
        setError("تعذر تحميل السورة. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };
    fetchSurah();
  }, [surahNum]);

  // Fetch tafseer for selected ayah
  const fetchTafseer = useCallback(async (ayahNumber: number, tafsId: number) => {
    setTafseerLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("quran-api", {
        body: { action: "tafseer", surahId: surahNum, ayahNumber, tafseerId: tafsId },
      });
      if (fnError) throw fnError;
      setTafseerText(data.tafseer || "لا يتوفر تفسير لهذه الآية.");
      setTafseerName(data.tafseerName || "");
    } catch {
      setTafseerText("تعذر تحميل التفسير.");
    } finally {
      setTafseerLoading(false);
    }
  }, [surahNum]);

  const handleAyahClick = (ayahNumber: number) => {
    if (selectedAyah === ayahNumber) {
      setSelectedAyah(null);
      setTafseerText("");
      return;
    }
    setSelectedAyah(ayahNumber);
    fetchTafseer(ayahNumber, tafseerId);
  };

  const handleTafseerChange = (newTafseerId: number) => {
    setTafseerId(newTafseerId);
    if (selectedAyah) fetchTafseer(selectedAyah, newTafseerId);
  };

  const handleCopy = (text: string, ayahNumber: number) => {
    const surahName = surahInfo?.name || "";
    navigator.clipboard.writeText(`﴿${text}﴾ [${surahName}: ${ayahNumber}]`);
    setCopiedAyah(ayahNumber);
    toast.success("تم نسخ الآية");
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const goToSurah = (id: number) => {
    if (id >= 1 && id <= 114) navigate(`/quran/${id}`);
  };

  return (
    <div className="min-h-screen bg-background" style={{ direction: "rtl" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/quran")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
          <BookOpen className="w-5 h-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground text-sm truncate">
              سورة {surahInfo?.name || ""}
            </h1>
            <p className="text-muted-foreground text-xs">
              {surahInfo?.versesCount} آية · {surahInfo?.revelationType}
            </p>
          </div>
          {/* Surah navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToSurah(surahNum - 1)}
              disabled={surahNum <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-30 transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <span className="text-xs text-muted-foreground w-10 text-center">{surahNum}/114</span>
            <button
              onClick={() => goToSurah(surahNum + 1)}
              disabled={surahNum >= 114}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-30 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Bismillah */}
        {surahNum !== 1 && surahNum !== 9 && (
          <div className="text-center mb-8">
            <p className="text-2xl text-primary font-bold leading-loose">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-primary hover:underline text-sm">
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Ayahs */}
        {!loading && !error && (
          <div className="space-y-3">
            {ayahs.map((ayah) => (
              <div key={ayah.number}>
                <div
                  className={`bg-card border rounded-2xl p-4 transition-all duration-200 cursor-pointer group ${
                    selectedAyah === ayah.number
                      ? "border-primary/50 shadow-md"
                      : "border-border/40 hover:border-primary/30 hover:shadow-sm"
                  }`}
                  onClick={() => handleAyahClick(ayah.number)}
                >
                  <div className="flex items-start gap-3">
                    {/* Ayah number */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0 mt-1">
                      {ayah.number}
                    </div>
                    {/* Ayah text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-lg leading-[2.2] font-medium">{ayah.text}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(ayah.text, ayah.number); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        {copiedAyah === ayah.number ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground">
                        {selectedAyah === ayah.number ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tafseer panel */}
                {selectedAyah === ayah.number && (
                  <div className="mt-2 bg-accent/50 border border-primary/20 rounded-2xl p-4 animate-slide-up">
                    {/* Tafseer selector */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
                      {TAFSEER_OPTIONS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleTafseerChange(t.id)}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            tafseerId === t.id
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>

                    {tafseerLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-muted-foreground text-sm mr-2">جاري تحميل التفسير...</span>
                      </div>
                    ) : (
                      <div>
                        {tafseerName && (
                          <p className="text-primary text-xs font-bold mb-2">{tafseerName}</p>
                        )}
                        <p className="text-foreground text-sm leading-[2] whitespace-pre-line">{tafseerText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom navigation */}
        {!loading && !error && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/30">
            <button
              onClick={() => goToSurah(surahNum + 1)}
              disabled={surahNum >= 114}
              className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-30"
            >
              <ArrowRight className="w-4 h-4" />
              السورة التالية
            </button>
            <button
              onClick={() => goToSurah(surahNum - 1)}
              disabled={surahNum <= 1}
              className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-30"
            >
              السورة السابقة
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SurahViewPage;
