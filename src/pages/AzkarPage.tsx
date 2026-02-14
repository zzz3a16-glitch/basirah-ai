import { FC, useState } from "react";
import { azkarCategories, azkarData } from "@/data/azkar";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AzkarPage: FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("morning");
  const [counts, setCounts] = useState<Record<number, number>>({});

  const currentAzkar = azkarData[activeCategory] || [];

  const handleCount = (id: number, max: number) => {
    if (max === 0) return;
    setCounts(prev => {
      const current = prev[id] || 0;
      if (current >= max) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const resetCount = (id: number) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="min-h-screen bg-background" style={{ direction: "rtl" }}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-lg">📿</span>
          <h1 className="font-bold text-foreground">الأذكار</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-5 scrollbar-hide">
          {azkarCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setCounts({}); }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Azkar list */}
        <div className="space-y-3">
          {currentAzkar.map(zikr => {
            const current = counts[zikr.id] || 0;
            const isDone = zikr.count > 0 && current >= zikr.count;
            const progress = zikr.count > 0 ? (current / zikr.count) * 100 : 0;
            return (
              <div
                key={zikr.id}
                onClick={() => handleCount(zikr.id, zikr.count)}
                className={`bg-card border rounded-2xl p-5 transition-all duration-200 cursor-pointer active:scale-[0.99] ${isDone ? "border-primary/30 opacity-50" : "border-border/40 hover:border-primary/20"}`}
              >
                <p className="text-foreground leading-[2] text-base mb-4 font-light select-none">{zikr.text}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">📚 {zikr.reference}</span>
                  {zikr.count > 0 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); resetCount(zikr.id); }}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      {/* Progress circle */}
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2.5"
                            strokeDasharray={`${progress * 0.942} 94.2`}
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                          {current}/{zikr.count}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AzkarPage;
