import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatHistory from "@/components/ChatHistory";
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
}

const STORAGE_KEY = "basirah_chat_sessions";

const loadSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

const defaultResponse = {
  answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Save current chat to sessions when messages change
  const saveCurrentChat = useCallback((msgs: Message[]) => {
    if (msgs.length === 0) return;
    
    const firstUserMsg = msgs.find(m => m.isUser);
    const title = firstUserMsg 
      ? (firstUserMsg.content as string).slice(0, 50) + ((firstUserMsg.content as string).length > 50 ? "..." : "")
      : "محادثة جديدة";

    setSessions(prev => {
      let updated: ChatSession[];
      if (activeSessionId) {
        updated = prev.map(s => s.id === activeSessionId ? { ...s, messages: msgs, title } : s);
      } else {
        const newId = Date.now().toString();
        setActiveSessionId(newId);
        updated = [{ id: newId, title, timestamp: Date.now(), messages: msgs }, ...prev];
      }
      saveSessions(updated);
      return updated;
    });
  }, [activeSessionId]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('islamic-search', {
        body: { question: text }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      const response = data?.result || defaultResponse;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        animate: true,
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      saveCurrentChat(finalMessages);
    } catch (error) {
      console.error("Error fetching response:", error);
      toast.error("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: {
          answer: "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.",
        },
        isUser: false,
        animate: true,
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages.map(m => ({ ...m, animate: false })));
      setActiveSessionId(id);
      setIsHistoryOpen(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveSessions(updated);
      return updated;
    });
    if (activeSessionId === id) {
      setMessages([]);
      setActiveSessionId(null);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader 
        onNewChat={handleNewChat} 
        hasMessages={hasMessages}
        onOpenHistory={() => setIsHistoryOpen(true)}
        sessionCount={sessions.length}
      />
      
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions.map(s => ({ id: s.id, title: s.title, timestamp: s.timestamp }))}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-20 pb-32">
        {!hasMessages ? (
          <WelcomeScreen onExampleClick={handleSend} />
        ) : (
          <div className="py-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                animate={message.animate}
                onSuggestedClick={handleSend}
              />
            ))}
            {isLoading && (
              <ChatMessage
                content=""
                isUser={false}
                isLoading={true}
              />
            )}
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
