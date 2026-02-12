import { FC, useState, ReactNode } from "react";
import TypewriterText from "./TypewriterText";
import { ChevronDown, ChevronUp, BookOpen, AlertCircle, Scale, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageContent {
  answer: string;
  sources?: string[];
  evidence?: string;
  source?: string;
  note?: string;
  suggestedQuestion?: string;
}

interface ChatMessageProps {
  content: MessageContent | string;
  isUser: boolean;
  isLoading?: boolean;
  animate?: boolean;
  onSuggestedClick?: (question: string) => void;
  userName?: string;
}

// Highlight Quranic verses ﴿ ﴾ in green
const formatAnswer = (text: string): ReactNode[] => {
  const cleaned = text.replace(/\*/g, "");
  const parts = cleaned.split(/(﴿[^﴾]+﴾)/g);

  return parts.map((part, i) => {
    if (part.startsWith("﴿") && part.endsWith("﴾")) {
      return (
        <span key={i} className="text-primary font-semibold">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const ChatMessage: FC<ChatMessageProps> = ({
  content,
  isUser,
  isLoading = false,
  animate = false,
  onSuggestedClick,
  userName = "أنت",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(!animate);

  if (isUser) {
    return (
      <div className="flex justify-start mb-6 animate-slide-up">
        <div className="max-w-[85%] md:max-w-[75%]">
          {/* اسم المستخدم */}
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary">{userName}</span>
          </div>
          {/* بوكس الرسالة الأخضر */}
          <div className="bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-sm px-5 py-3">
            <p className="text-foreground leading-relaxed font-normal">{content as string}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] md:max-w-[75%]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm">جارٍ البحث في المصادر...</span>
          </div>
        </div>
      </div>
    );
  }

  const messageContent = typeof content === "string"
    ? { answer: content }
    : content;

  const cleanedAnswer = messageContent.answer.replace(/\*/g, "");

  const allSources = messageContent.sources ||
    (messageContent.source ? [messageContent.source] : []);
  const hasSources = allSources.length > 0;

  const hasDisagreement = cleanedAnswer.includes("خلاف") || cleanedAnswer.includes("اختلف") || cleanedAnswer.includes("اختلاف");

  return (
    <div className="flex justify-end mb-8 animate-slide-up">
      <div className="max-w-[90%] md:max-w-[80%] w-full">
        {/* اسم بصيرة */}
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <span className="text-xs font-bold text-primary tracking-wide">بصيرة</span>
        </div>

        {/* Main Answer - وزن خط عادي للإجابة */}
        <div className="text-foreground leading-loose text-base md:text-lg whitespace-pre-wrap font-light">
          {animate && !animationComplete ? (
            <TypewriterText
              text={cleanedAnswer}
              speed={10}
              onComplete={() => setAnimationComplete(true)}
              renderChar={(visibleText) => <>{formatAnswer(visibleText)}</>}
            />
          ) : (
            <p>{formatAnswer(cleanedAnswer)}</p>
          )}
        </div>

        {/* Fiqh disagreement notice - وزن خط متوسط */}
        {hasDisagreement && animationComplete && (
          <div className="mt-4 p-3 bg-amber-500/10 border-r-2 border-amber-500 rounded-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
              <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                هذه المسألة فيها خلاف بين أهل العلم. يُنصح بالرجوع إلى عالم شرعي موثوق للتحقق.
              </p>
            </div>
          </div>
        )}

        {/* Note - وزن خط متوسط */}
        {messageContent.note && animationComplete && (
          <div className="mt-4 p-3 bg-primary/5 border-r-2 border-primary rounded-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-foreground/80 text-sm leading-relaxed font-medium">
                {messageContent.note}
              </p>
            </div>
          </div>
        )}

        {/* Suggested Question */}
        {messageContent.suggestedQuestion && animationComplete && (
          <div className="mt-4 animate-fade-in">
            <button
              onClick={() => onSuggestedClick?.(messageContent.suggestedQuestion!)}
              className="text-muted-foreground text-sm hover:text-primary transition-colors cursor-pointer text-right font-normal"
            >
              💡 {messageContent.suggestedQuestion}
            </button>
          </div>
        )}

        {/* Expandable Sources - وزن خفيف */}
        {hasSources && animationComplete && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2 font-normal",
                "border-t border-border/30 pt-4"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>المصادر ({allSources.length})</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 mr-auto" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-auto" />
              )}
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
              )}
            >
              <div className="space-y-2 pr-2">
                {allSources.map((src, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground font-light">
                    <span className="text-primary mt-0.5 flex-shrink-0">{idx + 1}.</span>
                    <span>{src}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
