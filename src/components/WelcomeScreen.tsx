import { FC } from "react";
import basirahLogo from "@/assets/basirah-logo.png";

interface WelcomeScreenProps {
  onExampleClick: (question: string) => void;
}

const WelcomeScreen: FC<WelcomeScreenProps> = ({ onExampleClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <img 
          src={basirahLogo} 
          alt="بصيرة" 
          className="h-16 md:h-20 mx-auto mb-6 opacity-90"
        />
        <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
          ذكاء اصطناعي إسلامي موثوق يلتزم بمنهج أهل السنة والجماعة
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
