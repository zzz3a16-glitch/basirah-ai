import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatHistory from "@/components/ChatHistory";
import PrivacyDialog from "@/components/PrivacyDialog";
import SettingsDialog from "@/components/SettingsDialog";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string | {
    answer: string;
    sources?: string[];
    evidence?: string;
    source?: string;
    note?: string;
    suggestedQuestion?: string;
  };
  isUser: boolean;
  animate?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
  pinned?: boolean;
  dbId?: string; // database UUID
}

const STORAGE_KEY = "basirah_chat_sessions";

const loadLocalSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const sessions: ChatSession[] = raw ? JSON.parse(raw) : [];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions.filter(s => s.pinned || s.timestamp > weekAgo);
  } catch { return []; }
};

const defaultResponse = {
  answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
};

const Index = () => {
  const { user, displayName, signOut, updateDisplayName } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem("basirah_user_name") || "أنت");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from DB or localStorage
  useEffect(() => {
    if (user) {
      loadDbSessions();
    } else {
      setSessions(loadLocalSessions());
    }
  }, [user]);

  // Sync displayName
  useEffect(() => {
    if (displayName) setUserName(displayName);
  }, [displayName]);

  const loadDbSessions = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) {
      setSessions(data.map(c => ({
        id: c.id,
        dbId: c.id,
        title: c.title,
        timestamp: new Date(c.updated_at).getTime(),
        messages: (c.messages as unknown as Message[]) || [],
        pinned: c.pinned,
      })));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const saveChat = useCallback(async (msgs: Message[], sessionId?: string | null) => {
    if (msgs.length === 0) return;
    const firstUserMsg = msgs.find(m => m.isUser);
    const title = firstUserMsg
      ? (firstUserMsg.content as string).slice(0, 50) + ((firstUserMsg.content as string).length > 50 ? "..." : "")
      : "محادثة جديدة";

    if (user) {
      // Save to database
      if (sessionId) {
        await supabase.from("conversations").update({ messages: msgs as any, title }).eq("id", sessionId);
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: msgs, title } : s));
      } else {
        const { data } = await supabase.from("conversations").insert({
          user_id: user.id, title, messages: msgs as any,
        }).select().single();
        if (data) {
          const newSession: ChatSession = {
            id: data.id, dbId: data.id, title, timestamp: Date.now(), messages: msgs,
          };
          setActiveSessionId(data.id);
          setSessions(prev => [newSession, ...prev]);
        }
      }
    } else {
      // Save to localStorage
      setSessions(prev => {
        let updated: ChatSession[];
        if (sessionId) {
          updated = prev.map(s => s.id === sessionId ? { ...s, messages: msgs, title } : s);
        } else {
          const newId = Date.now().toString();
          setActiveSessionId(newId);
          updated = [{ id: newId, title, timestamp: Date.now(), messages: msgs }, ...prev];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  const handleSend = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), content: text, isUser: true };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('islamic-search', {
        body: { question: text }
      });
      if (error) throw error;
      const response = data?.result || defaultResponse;
      const aiMessage: Message = { id: (Date.now() + 1).toString(), content: response, isUser: false, animate: true };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      await saveChat(finalMessages, activeSessionId);
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: { answer: "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى." },
        isUser: false, animate: true,
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => { setMessages([]); setActiveSessionId(null); };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages.map(m => ({ ...m, animate: false })));
      setActiveSessionId(id);
      setIsHistoryOpen(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (user) {
      await supabase.from("conversations").delete().eq("id", id);
    }
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (!user) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (activeSessionId === id) { setMessages([]); setActiveSessionId(null); }
  };

  const handleTogglePin = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    const newPinned = !session.pinned;
    if (user) {
      await supabase.from("conversations").update({ pinned: newPinned }).eq("id", id);
    }
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, pinned: newPinned } : s);
      if (!user) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleUserNameChange = (name: string) => {
    setUserName(name);
    if (user) updateDisplayName(name);
    else localStorage.setItem("basirah_user_name", name);
  };

  const handleClearAllChats = async () => {
    if (user) {
      await supabase.from("conversations").delete().eq("pinned", false).eq("user_id", user.id);
    }
    const pinned = sessions.filter(s => s.pinned);
    setSessions(pinned);
    if (!user) localStorage.setItem(STORAGE_KEY, JSON.stringify(pinned));
    if (!pinned.find(s => s.id === activeSessionId)) { setMessages([]); setActiveSessionId(null); }
    toast.success("تم حذف المحادثات غير المثبّتة");
  };

  const handleSignOut = async () => {
    await signOut();
    setMessages([]);
    setActiveSessionId(null);
    setSessions([]);
    setIsHistoryOpen(false);
    toast.success("تم تسجيل الخروج");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader onNewChat={handleNewChat} hasMessages={hasMessages} onOpenHistory={() => setIsHistoryOpen(true)} sessionCount={sessions.length} />

      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions.map(s => ({ id: s.id, title: s.title, timestamp: s.timestamp, pinned: s.pinned }))}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onTogglePin={handleTogglePin}
        onOpenPrivacy={() => { setIsHistoryOpen(false); setIsPrivacyOpen(true); }}
        onOpenSettings={() => { setIsHistoryOpen(false); setIsSettingsOpen(true); }}
        isLoggedIn={!!user}
        onSignOut={handleSignOut}
      />

      <PrivacyDialog isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userName}
        onUserNameChange={handleUserNameChange}
        onClearAllChats={handleClearAllChats}
      />

      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-20 pb-32">
        {!hasMessages ? (
          <WelcomeScreen onExampleClick={handleSend} />
        ) : (
          <div className="py-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} content={message.content} isUser={message.isUser} animate={message.animate} onSuggestedClick={handleSend} userName={userName} />
            ))}
            {isLoading && <ChatMessage content="" isUser={false} isLoading={true} />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4 px-4">
        <div className="container max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Index;
