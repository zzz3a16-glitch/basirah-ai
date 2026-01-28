import { FC, useState } from "react";
import TypewriterText from "./TypewriterText";
import { BookOpen, FileText, Sparkles } from "lucide-react";

interface MessageContent {
  answer: string;
  evidence?: string;
  source?: string;
  note?: string;
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
  const [showEvidence, setShowEvidence] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showNote, setShowNote] = useState(false);

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

  return (
    <div className="flex justify-end mb-8 animate-slide-up">
      <div className="max-w-[90%] md:max-w-[80%]">
        {/* Answer Section */}
        <div className="answer-section mb-4">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">الجواب</span>
          </div>
          <div className="text-foreground leading-loose text-lg">
            {animate ? (
              <TypewriterText 
                text={messageContent.answer} 
                speed={15}
                onComplete={() => setShowEvidence(true)}
              />
            ) : (
              <p>{messageContent.answer}</p>
            )}
          </div>
        </div>

        {/* Evidence Section */}
        {messageContent.evidence && (showEvidence || !animate) && (
          <div className="evidence-card mb-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">الدليل</span>
            </div>
            <p className="text-foreground/90 leading-loose">
              {animate && !showSource ? (
                <TypewriterText 
                  text={messageContent.evidence} 
                  speed={12}
                  onComplete={() => setShowSource(true)}
                />
              ) : (
                messageContent.evidence
              )}
            </p>
          </div>
        )}

        {/* Source Section */}
        {messageContent.source && (showSource || !animate) && (
          <div className="flex items-center gap-2 mb-4 animate-fade-in">
            <FileText className="w-4 h-4 text-primary/70" />
            <span className="source-text">{messageContent.source}</span>
          </div>
        )}

        {/* Note Section */}
        {messageContent.note && (showNote || showSource || !animate) && (
          <div className="border-t border-border/50 pt-3 mt-4 animate-fade-in">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="text-primary/70">فائدة: </span>
              {messageContent.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
