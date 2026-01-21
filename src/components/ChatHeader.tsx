import { FC } from "react";
import BasirahLogo from "./BasirahLogo";
import { RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface ChatHeaderProps {
  onNewChat: () => void;
  hasMessages: boolean;
}

const ChatHeader: FC<ChatHeaderProps> = ({ onNewChat, hasMessages }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BasirahLogo size="sm" />
          <div>
            <h1 className="text-lg font-bold spiritual-gradient-text">بصيرة</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Basirah AI</p>
          </div>
        </div>
        
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            محادثة جديدة
          </Button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
