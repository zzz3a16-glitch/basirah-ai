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
  color: "bg-primary/10 text-primary border-primary/20"
},
{
  icon: Heart,
  emoji: "📿",
  title: "الأذكار",
  description: "أذكار الصباح والمساء وأذكار متنوعة",
  path: "/azkar",
  color: "bg-amber-500/10 text-amber-500 border-amber-500/20"
},
{
  icon: Sparkles,
  emoji: "🤲",
  title: "الأدعية",
  description: "أدعية قرآنية ونبوية مأثورة",
  path: "/duas",
  color: "bg-sky-500/10 text-sky-500 border-sky-500/20"
}];


const exampleQuestions = [
"ما حكم صلاة الوتر؟",
"ما هي أركان الإسلام؟",
"ما حكم الزكاة على الذهب؟",
"كيف أصلي صلاة الاستخارة؟"];


const WelcomeScreen: FC<WelcomeScreenProps> = ({ onExampleClick }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <img
          alt="بصيرة"
          className="h-16 md:h-20 mx-auto mb-4 opacity-90" src="/lovable-uploads/8913e99b-4319-485e-8839-ff51914aa3d9.png" />


        


      </div>

      {/* Sections */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-8">
        {sections.map((section) =>
        <button
          key={section.path}
          onClick={() => navigate(section.path)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${section.color}`}>

            <span className="text-2xl">{section.emoji}</span>
            <span className="text-xs font-bold">{section.title}</span>
          </button>
        )}
      </div>

      {/* Example questions */}
      













    </div>);

};

export default WelcomeScreen;