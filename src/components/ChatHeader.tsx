import { FC } from "react";
import { MessageSquarePlus, History, Home } from "lucide-react";
import basirahLogo from "@/assets/basirah-logo.png";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  onNewChat: () => void;
  hasMessages: boolean;
  onOpenHistory?: () => void;
  sessionCount?: number;
}

const ChatHeader: FC<ChatHeaderProps> = ({ onNewChat, hasMessages, onOpenHistory, sessionCount = 0 }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={basirahLogo} alt="بصيرة" className="h-8 opacity-90 cursor-pointer" onClick={() => navigate("/")} />
        </div>
        <div className="flex items-center gap-1">
          {hasMessages && (
            <button
              onClick={() => { onNewChat(); navigate("/"); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              title="الصفحة الرئيسية"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>
          )}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">القائمة</span>
          </button>
          {hasMessages && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden sm:inline">محادثة جديدة</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
