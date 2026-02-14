import { FC, useState, ReactNode } from "react";
import TypewriterText from "./TypewriterText";
import { ChevronDown, ChevronUp, BookOpen, AlertCircle, Scale, User, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageContent {
  title?: string;
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

// Format answer: Quranic verses in green bubble, Hadiths in light green, paragraphs separated
const formatAnswer = (text: string): ReactNode[] => {
  const cleaned = text.replace(/\*/g, "");
  // Split by both ﴿...﴾ and «...»
  const parts = cleaned.split(/(﴿[^﴾]+﴾|«[^»]+»)/g);

  return parts.map((part, i) => {
    if (part.startsWith("﴿") && part.endsWith("﴾")) {
      return (
        <span
          key={i}
          className="inline-block my-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold leading-relaxed"
        >
          {part}
        </span>
      );
    }
    if (part.startsWith("«") && part.endsWith("»")) {
      return (
        <span
          key={i}
          className="inline-block my-1.5 px-3 py-1.5 rounded-lg font-medium text-[hsl(var(--hadith))] bg-[hsl(var(--hadith)_/_0.08)] border border-[hsl(var(--hadith)_/_0.15)]"
        >
          {part}
        </span>
      );
    }
    // Split plain text into paragraphs
    const paragraphs = part.split(/\n\n+/);
    if (paragraphs.length > 1) {
      return paragraphs.map((p, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {p}
        </span>
      ));
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
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary">{userName}</span>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-5 py-3">
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
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm">جارٍ البحث في المصادر الشرعية...</span>
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
        {/* Header with title */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <Bookmark className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary tracking-wide">بصيرة</span>
        </div>

        {/* Title if available */}
        {messageContent.title && animationComplete && (
          <div className="mb-4 pb-3 border-b border-border/30">
            <h3 className="text-lg font-bold text-foreground">{messageContent.title}</h3>
          </div>
        )}

        {/* Answer body */}
        <div className="text-foreground leading-[2] text-base md:text-[17px] whitespace-pre-wrap font-light">
          {animate && !animationComplete ? (
            <TypewriterText
              text={cleanedAnswer}
              speed={8}
              onComplete={() => setAnimationComplete(true)}
              renderChar={(visibleText) => <>{formatAnswer(visibleText)}</>}
            />
          ) : (
            <div>{formatAnswer(cleanedAnswer)}</div>
          )}
        </div>

        {/* Disagreement notice */}
        {hasDisagreement && animationComplete && (
          <div className="mt-5 p-3.5 bg-amber-500/8 border-r-2 border-amber-500/60 rounded-lg animate-fade-in">
            <div className="flex items-start gap-2.5">
              <Scale className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
              <p className="text-foreground/75 text-sm leading-relaxed font-medium">
                هذه المسألة فيها خلاف بين أهل العلم. يُنصح بالرجوع إلى عالم شرعي موثوق للتحقق.
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        {messageContent.note && animationComplete && (
          <div className="mt-5 p-3.5 bg-primary/5 border-r-2 border-primary/40 rounded-lg animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-foreground/75 text-sm leading-relaxed font-medium">
                {messageContent.note}
              </p>
            </div>
          </div>
        )}

        {/* Suggested question */}
        {messageContent.suggestedQuestion && animationComplete && (
          <div className="mt-5 animate-fade-in">
            <button
              onClick={() => onSuggestedClick?.(messageContent.suggestedQuestion!)}
              className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200 cursor-pointer text-right font-normal px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              💡 {messageContent.suggestedQuestion}
            </button>
          </div>
        )}

        {/* Sources - collapsible */}
        {hasSources && animationComplete && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-full py-2.5 font-normal",
                "border-t border-border/20 pt-4"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>المصادر ({allSources.length})</span>
              {isExpanded ? <ChevronUp className="w-4 h-4 mr-auto" /> : <ChevronDown className="w-4 h-4 mr-auto" />}
            </button>
            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
            )}>
              <div className="space-y-2 pr-2 bg-card/50 rounded-lg p-3 border border-border/20">
                {allSources.map((src, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground font-light">
                    <span className="text-primary mt-0.5 flex-shrink-0 font-medium">{idx + 1}.</span>
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
