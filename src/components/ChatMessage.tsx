import { FC, useState, useRef } from "react";
import TypewriterText from "./TypewriterText";
import { BookOpen, FileText, Sparkles, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

interface MessageContent {
  title?: string;
  answer: string;
  evidence?: string;
  source?: string;
  note?: string;
  videoUrl?: string;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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
        {/* Title Section */}
        {messageContent.title && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary leading-relaxed">
              {messageContent.title}
            </h3>
          </div>
        )}

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

        {/* Audio/Video Player Section */}
        {messageContent.videoUrl && (
          <div className="audio-player-section mb-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">استمع للفتوى</span>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 mr-[-2px]" />}
                </Button>
                <div className="flex-1">
                  <video
                    ref={videoRef}
                    src={messageContent.videoUrl}
                    className="hidden"
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                  <div className="text-sm text-muted-foreground">
                    {isPlaying ? "جارٍ التشغيل..." : "اضغط للاستماع"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
