import { FC } from "react";
import BasirahLogo from "./BasirahLogo";
import { BookOpen, Shield, FileCheck } from "lucide-react";

interface WelcomeScreenProps {
  onExampleClick: (question: string) => void;
}

const WelcomeScreen: FC<WelcomeScreenProps> = ({ onExampleClick }) => {
  const examples = [
    "ما حكم صلاة الجماعة في المسجد؟",
    "ما هي شروط الوضوء؟",
    "ما حكم زكاة الذهب؟",
  ];

  const features = [
    {
      icon: BookOpen,
      title: "مصادر موثوقة",
      description: "القرآن الكريم والصحيحين وفتاوى العلماء المعتمدين",
    },
    {
      icon: Shield,
      title: "منهج أهل السنة",
      description: "التزام صارم بمنهج أهل السنة والجماعة",
    },
    {
      icon: FileCheck,
      title: "توثيق دقيق",
      description: "كل جواب مع الدليل والمصدر بدقة",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      {/* Logo and Title */}
      <div className="text-center mb-10">
        <BasirahLogo size="lg" className="mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold mb-3 spiritual-gradient-text">
          بصيرة
        </h1>
        <p className="text-muted-foreground text-lg">
          ذكاء اصطناعي إسلامي موثوق
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full max-w-3xl">
        {features.map((feature, index) => (
          <div
            key={index}
            className="glass-card rounded-xl p-5 text-center hover:border-primary/30 transition-colors duration-200"
          >
            <feature.icon className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="text-foreground font-medium mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Example Questions */}
      <div className="w-full max-w-2xl">
        <p className="text-muted-foreground text-sm text-center mb-4">
          جرّب أحد الأسئلة التالية:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(example)}
              className="bg-secondary hover:bg-muted border border-border/50 hover:border-primary/30 rounded-full px-5 py-2.5 text-sm text-foreground transition-all duration-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
