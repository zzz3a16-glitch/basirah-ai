import { FC } from "react";
import { MessageSquare, X, Trash2, Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  pinned?: boolean;
}

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onTogglePin,
}) => {
  const pinnedSessions = sessions.filter(s => s.pinned);
  const unpinnedSessions = sessions.filter(s => !s.pinned);

  const renderSession = (session: ChatSession) => (
    <div
      key={session.id}
      className={cn(
        "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors mb-1",
        activeSessionId === session.id
          ? "bg-primary/10 text-foreground"
          : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
      )}
      onClick={() => onSelectSession(session.id)}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm truncate flex-1">{session.title}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(session.id); }}
          className="text-muted-foreground hover:text-primary transition-colors"
          title={session.pinned ? "إلغاء التثبيت" : "تثبيت"}
        >
          {session.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 h-full w-72 bg-card border-l border-border z-50 transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-foreground font-medium text-sm">المحادثات السابقة</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">لا توجد محادثات سابقة</p>
          ) : (
            <>
              {pinnedSessions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground px-3 py-1 flex items-center gap-1">
                    <Pin className="w-3 h-3" /> مثبّتة
                  </p>
                  {pinnedSessions.map(renderSession)}
                </div>
              )}
              {unpinnedSessions.length > 0 && (
                <div>
                  {pinnedSessions.length > 0 && (
                    <p className="text-xs text-muted-foreground px-3 py-1">أخرى</p>
                  )}
                  {unpinnedSessions.map(renderSession)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHistory;
