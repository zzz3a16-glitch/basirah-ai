import { FC, useState } from "react";
import { duaCategories, duasData } from "@/data/duas";
import { ArrowRight, Copy, Check } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background" style={{ direction: "rtl" }}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-lg">🤲</span>
          <h1 className="font-bold text-foreground">الأدعية</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {duaCategories.map(cat => (
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

        {/* Duas list */}
        <div className="space-y-3">
          {currentDuas.map(dua => (
            <div key={dua.id} className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-primary text-sm">{dua.title}</h3>
                <button
                  onClick={() => handleCopy(dua.text, dua.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {copiedId === dua.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-foreground leading-loose text-base font-light mb-2">{dua.text}</p>
              <span className="text-xs text-muted-foreground">📖 {dua.reference}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DuasPage;
