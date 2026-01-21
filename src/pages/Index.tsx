import { useState, useRef, useEffect } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import WelcomeScreen from "@/components/WelcomeScreen";

interface Message {
  id: string;
  content: string | {
    answer: string;
    evidence?: string;
    source?: string;
    note?: string;
  };
  isUser: boolean;
  animate?: boolean;
}

// Sample responses for demonstration
const sampleResponses: Record<string, {
  answer: string;
  evidence?: string;
  source?: string;
  note?: string;
}> = {
  "ما حكم صلاة الجماعة في المسجد؟": {
    answer: "صلاة الجماعة في المسجد واجبة على الرجال القادرين، وهي من أعظم شعائر الإسلام الظاهرة، ومن تركها بلا عذر فقد ارتكب إثماً عظيماً.",
    evidence: "قال رسول الله ﷺ: «والذي نفسي بيده، لقد هممت أن آمر بحطب فيُحطب، ثم آمر بالصلاة فيؤذن لها، ثم آمر رجلاً فيؤم الناس، ثم أخالف إلى رجال لا يشهدون الصلاة فأحرق عليهم بيوتهم»",
    source: "صحيح البخاري - كتاب الأذان، باب وجوب صلاة الجماعة",
    note: "يُستثنى من الوجوب المريض والخائف والمعذور بعذر شرعي معتبر."
  },
  "ما هي شروط الوضوء؟": {
    answer: "شروط صحة الوضوء ستة: الإسلام، والعقل، والتمييز، والنية، واستصحاب حكمها بأن لا ينوي قطعها حتى تتم الطهارة، وانقطاع موجب الوضوء، وإزالة ما يمنع وصول الماء.",
    evidence: "قال الله تعالى: ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ﴾",
    source: "سورة المائدة - الآية 6",
    note: "فروض الوضوء ستة: غسل الوجه، وغسل اليدين إلى المرفقين، ومسح الرأس، وغسل الرجلين، والترتيب، والموالاة."
  },
  "ما حكم زكاة الذهب؟": {
    answer: "تجب الزكاة في الذهب إذا بلغ النصاب وهو عشرون مثقالاً (85 جراماً تقريباً) وحال عليه الحول، ومقدار الزكاة ربع العشر (2.5%).",
    evidence: "قال رسول الله ﷺ: «ما من صاحب ذهب ولا فضة لا يؤدي منها حقها، إلا إذا كان يوم القيامة صُفِّحت له صفائح من نار، فأُحمي عليها في نار جهنم، فيُكوى بها جنبه وجبينه وظهره»",
    source: "صحيح مسلم - كتاب الزكاة",
    note: "الذهب المُعد للاستعمال والحلي فيه خلاف بين العلماء، والأحوط إخراج زكاته."
  },
};

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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = sampleResponses[text] || defaultResponse;

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      isUser: false,
      animate: true,
    };

    setIsLoading(false);
    setMessages((prev) => [...prev, aiMessage]);
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
