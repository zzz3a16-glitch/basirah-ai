import { FC } from "react";
import { BookOpen, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeScreenProps {
  onExampleClick: (question: string) => void;
}

const sections = [
  {
    icon: BookOpen,
    emoji: "📖",
    title: "القرآن الكريم",
    description: "المصحف كاملاً مرتبًا بالسور",
    path: "/quran",
  },
  {
    icon: Heart,
    emoji: "📿",
    title: "الأذكار",
    description: "أذكار الصباح والمساء",
    path: "/azkar",
  },
  {
    icon: Sparkles,
    emoji: "🤲",
    title: "الأدعية",
    description: "أدعية قرآنية ونبوية",
    path: "/duas",
  },
];

const exampleQuestions = [
  "ما حكم صلاة الوتر؟",
  "ما هي أركان الإسلام؟",
  "ما حكم الزكاة على الذهب؟",
  "كيف أصلي صلاة الاستخارة؟",
];

const WelcomeScreen: FC<WelcomeScreenProps> = ({ onExampleClick }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-10">
        <img
          alt="بصيرة"
          className="h-16 md:h-20 mx-auto mb-3 opacity-90"
          src="/lovable-uploads/8913e99b-4319-485e-8839-ff51914aa3d9.png"
        />
      </div>

      {/* Sections */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-10">
        {sections.map((section) => (
          <button
            key={section.path}
            onClick={() => navigate(section.path)}
            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:border-primary/30 hover:bg-card active:scale-[0.97]"
          >
            <span className="text-2xl">{section.emoji}</span>
            <span className="text-xs font-bold text-foreground">{section.title}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{section.description}</span>
          </button>
        ))}
      </div>

      {/* Example questions */}
      <div className="w-full max-w-md space-y-2">
        <p className="text-xs text-muted-foreground text-center mb-3">أمثلة للأسئلة</p>
        <div className="grid grid-cols-2 gap-2">
          {exampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onExampleClick(q)}
              className="text-sm text-muted-foreground hover:text-foreground text-right px-4 py-3 rounded-xl border border-border/30 bg-card/30 hover:bg-card/60 hover:border-primary/20 transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
