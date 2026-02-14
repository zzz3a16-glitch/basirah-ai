import { FC, useState } from "react";
import { duaCategories, duasData } from "@/data/duas";
import { ArrowRight, Copy, Check, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DuasPage: FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("quran");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const currentDuas = duasData[activeCategory] || [];

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ الدعاء");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success("تم نسخ الدعاء للمشاركة");
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ direction: "rtl" }}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-lg">🤲</span>
          <h1 className="font-bold text-foreground">الأدعية</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-5 scrollbar-hide">
          {duaCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Duas list */}
        <div className="space-y-3">
          {currentDuas.map(dua => (
            <div key={dua.id} className="bg-card border border-border/40 rounded-2xl p-5 transition-all duration-200 hover:border-primary/20">
              <h3 className="font-bold text-primary text-sm mb-3">{dua.title}</h3>
              <p className="text-foreground leading-[2] text-base font-light mb-4">{dua.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">📖 {dua.reference}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(dua.text, dua.title)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/30"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(dua.text, dua.id)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/30"
                  >
                    {copiedId === dua.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DuasPage;
