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
    if (max === 0) return; // unlimited
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
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-lg">📿</span>
          <h1 className="font-bold text-foreground">الأذكار</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {azkarCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
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
            return (
              <div
                key={zikr.id}
                className={`bg-card border rounded-xl p-4 transition-all ${isDone ? "border-primary/40 opacity-60" : "border-border/50"}`}
              >
                <p className="text-foreground leading-loose text-base mb-3 font-light">{zikr.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">📚 {zikr.reference}</span>
                  {zikr.count > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resetCount(zikr.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCount(zikr.id, zikr.count)}
                        disabled={isDone}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isDone ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        {current}/{zikr.count}
                      </button>
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
