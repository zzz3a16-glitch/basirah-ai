import { FC, useState } from "react";
import { surahs } from "@/data/quranSurahs";
import { ArrowRight, Search, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuranPage: FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterJuz, setFilterJuz] = useState<number | null>(null);

  const filtered = surahs.filter(s => {
    const matchSearch = !search || s.name.includes(search) || s.id.toString() === search;
    const matchJuz = !filterJuz || s.juz === filterJuz;
    return matchSearch && matchJuz;
  });

  return (
    <div className="min-h-screen bg-background" style={{ direction: "rtl" }}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            <ArrowRight className="w-5 h-5" />
          </button>
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground">القرآن الكريم</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن سورة..."
            className="w-full bg-card border border-border/40 rounded-2xl px-4 py-3 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all duration-200"
          />
        </div>

        {/* Juz filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
          <button
            onClick={() => setFilterJuz(null)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${!filterJuz ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:text-foreground border border-border/40"}`}
          >
            الكل
          </button>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
            <button
              key={j}
              onClick={() => setFilterJuz(j)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${filterJuz === j ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:text-foreground border border-border/40"}`}
            >
              جزء {j}
            </button>
          ))}
        </div>

        {/* Surahs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filtered.map(surah => (
            <div
              key={surah.id}
              className="bg-card border border-border/40 rounded-2xl p-3.5 hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {surah.id}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors duration-200">{surah.name}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{surah.versesCount} آية · {surah.revelationType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default QuranPage;
