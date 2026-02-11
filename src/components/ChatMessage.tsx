import { FC, useState } from "react";
import TypewriterText from "./TypewriterText";
import { ChevronDown, ChevronUp, BookOpen, AlertCircle } from "lucide-react";
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
}

// Helper to highlight Quranic verses (between ﴿ ﴾) in green
const formatAnswer = (text: string) => {
  // Remove all asterisks
  let cleaned = text.replace(/\*/g, "");
  
  // Split by Quranic verse markers
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
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(!animate);

  if (isUser) {
    return (
      <div className="flex justify-start mb-6 animate-slide-up">
        <div className="max-w-[85%] md:max-w-[75%]">
          <div className="bg-secondary rounded-2xl rounded-tr-sm px-5 py-3">
            <p className="text-foreground leading-relaxed">{content as string}</p>
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

  // Clean asterisks from answer
  const cleanedAnswer = messageContent.answer.replace(/\*/g, "");

  // Collect all sources
  const allSources = messageContent.sources || 
    (messageContent.source ? [messageContent.source] : []);
  const hasSources = allSources.length > 0;

  return (
    <div className="flex justify-end mb-8 animate-slide-up">
      <div className="max-w-[90%] md:max-w-[80%] w-full">
        {/* Main Answer with inline evidence */}
        <div className="text-foreground leading-loose text-base md:text-lg whitespace-pre-wrap">
          {animate ? (
            <TypewriterText 
              text={cleanedAnswer} 
              speed={12}
              onComplete={() => setAnimationComplete(true)}
            />
          ) : (
            <p>{formatAnswer(cleanedAnswer)}</p>
          )}
        </div>

        {/* Note inline if exists */}
        {messageContent.note && animationComplete && (
          <div className="mt-4 p-3 bg-primary/5 border-r-2 border-primary rounded-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <p className="text-foreground/80 text-sm leading-relaxed">
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
              className="text-muted-foreground text-sm hover:text-primary transition-colors cursor-pointer text-right"
            >
              💡 {messageContent.suggestedQuestion}
            </button>
          </div>
        )}

        {/* Expandable Sources Section - only external sources */}
        {hasSources && animationComplete && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2",
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
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
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
