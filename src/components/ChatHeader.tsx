import { FC } from "react";
import { MessageSquarePlus } from "lucide-react";
import basirahLogo from "@/assets/basirah-logo.png";

interface ChatHeaderProps {
  onNewChat: () => void;
  hasMessages: boolean;
}

const ChatHeader: FC<ChatHeaderProps> = ({ onNewChat, hasMessages }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={basirahLogo} 
            alt="بصيرة" 
            className="h-8 opacity-90"
          />
        </div>

        {/* New Chat Button */}
        {hasMessages && (
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>محادثة جديدة</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
