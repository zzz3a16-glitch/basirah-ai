import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import WelcomeScreen from "@/components/WelcomeScreen";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string | {
    answer: string;
    evidence?: string;
    source?: string;
    note?: string;
    suggestedQuestion?: string;
  };
  isUser: boolean;
  animate?: boolean;
}

const defaultResponse = {
  answer: "لم يرد نص صريح أو فتوى معتمدة في هذه المسألة حسب المصادر المتاحة.",
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the edge function
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

      setMessages((prev) => [...prev, aiMessage]);
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
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader onNewChat={handleNewChat} hasMessages={hasMessages} />
      
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
