import { FC, useState } from "react";
import TypewriterText from "./TypewriterText";
import { ChevronDown, ChevronUp, BookOpen, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageContent {
  answer: string;
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
}

const ChatMessage: FC<ChatMessageProps> = ({
  content,
  isUser,
  isLoading = false,
  animate = false,
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

  const hasAdditionalInfo = messageContent.evidence || messageContent.source || messageContent.note;

  return (
    <div className="flex justify-end mb-8 animate-slide-up">
      <div className="max-w-[90%] md:max-w-[80%] w-full">
        {/* Main Answer - GPT Style */}
        <div className="text-foreground leading-loose text-base md:text-lg whitespace-pre-wrap">
          {animate ? (
            <TypewriterText 
              text={messageContent.answer} 
              speed={12}
              onComplete={() => setAnimationComplete(true)}
            />
          ) : (
            <p>{messageContent.answer}</p>
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
            <p className="text-muted-foreground text-sm italic">
              {messageContent.suggestedQuestion}
            </p>
          </div>
        )}

        {/* Expandable Source Section */}
        {hasAdditionalInfo && animationComplete && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2",
                "border-t border-border/30 pt-4"
              )}
            >
              <FileText className="w-4 h-4" />
              <span>عرض المصدر والتفاصيل</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 mr-auto" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-auto" />
              )}
            </button>

            {/* Expanded Content */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
              )}
            >
              <div className="space-y-4 pr-2">
                {/* Evidence */}
                {messageContent.evidence && (
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">الدليل</span>
                    </div>
                    <p className="text-foreground/85 text-sm leading-relaxed">
                      {messageContent.evidence}
                    </p>
                  </div>
                )}

                {/* Source */}
                {messageContent.source && (
                  <div className="flex items-start gap-2 text-muted-foreground text-sm">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{messageContent.source}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
