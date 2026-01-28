import { FC, useState, useRef, useEffect } from "react";
import TypewriterText from "./TypewriterText";
import { BookOpen, FileText, Sparkles, Play, Pause, Volume2, BookMarked, Quote } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface MessageContent {
  fatwaTitle?: string;
  answer: string;
  source?: string;
  evidence?: string;
  hadith?: string;
  audioUrl?: string;
  // Legacy support
  title?: string;
  videoUrl?: string;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setAudioError(true);
    }
  };

  const formatTime = (time: number): string => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  // Support both new and legacy field names
  const title = messageContent.fatwaTitle || messageContent.title;
  const audioUrl = messageContent.audioUrl || messageContent.videoUrl;

  return (
    <div className="flex justify-end mb-8 animate-slide-up">
      <div className="max-w-[90%] md:max-w-[80%] space-y-4">
        
        {/* Fatwa Title */}
        {title && (
          <div className="border-b border-border/30 pb-3">
            <div className="flex items-center gap-2 text-primary mb-1">
              <BookMarked className="w-4 h-4" />
              <span className="text-xs font-medium opacity-70">عنوان الفتوى</span>
            </div>
            <h3 className="text-xl font-bold text-foreground leading-relaxed">
              {title}
            </h3>
          </div>
        )}

        {/* Answer Section - Main */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">الجواب</span>
          </div>
          <div className="text-foreground leading-loose text-lg">
            {animate ? (
              <TypewriterText 
                text={messageContent.answer} 
                speed={15}
                onComplete={() => {
                  setShowEvidence(true);
                  setShowSource(true);
                }}
              />
            ) : (
              <p className="whitespace-pre-wrap">{messageContent.answer}</p>
            )}
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && !audioError && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-semibold">استمع للفتوى</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 mr-[-2px]" />
                )}
              </Button>
              
              <div className="flex-1 space-y-2">
                <Progress 
                  value={duration > 0 ? (currentTime / duration) * 100 : 0} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setCurrentTime(audioRef.current.currentTime);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              onError={() => setAudioError(true)}
            />
          </div>
        )}

        {/* Hadith Section */}
        {messageContent.hadith && (showEvidence || !animate) && (
          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
              <Quote className="w-4 h-4" />
              <span className="text-sm font-semibold">الحديث</span>
            </div>
            <p className="text-foreground/90 leading-loose italic">
              {messageContent.hadith}
            </p>
          </div>
        )}

        {/* Evidence Section */}
        {messageContent.evidence && (showEvidence || !animate) && (
          <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-semibold">الدليل</span>
            </div>
            <p className="text-foreground/90 leading-loose">
              {messageContent.evidence}
            </p>
          </div>
        )}

        {/* Source Section */}
        {messageContent.source && (showSource || !animate) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/30 animate-fade-in">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              المصدر: <span className="text-foreground/80 font-medium">{messageContent.source}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
