import { FC, useEffect, useState, ReactNode } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  renderChar?: (visibleText: string) => ReactNode;
}

const TypewriterText: FC<TypewriterTextProps> = ({
  text,
  speed = 15,
  className = "",
  onComplete,
  renderChar,
}) => {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (charCount < text.length) {
      // Speed up: reveal 2-3 chars at a time for longer texts
      const step = text.length > 200 ? 3 : text.length > 100 ? 2 : 1;
      const timeout = setTimeout(() => {
        setCharCount((prev) => Math.min(prev + step, text.length));
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [charCount, text, speed, onComplete]);

  useEffect(() => {
    setCharCount(0);
  }, [text]);

  const visibleText = text.slice(0, charCount);

  return (
    <span className={className}>
      {renderChar ? renderChar(visibleText) : visibleText}
      {charCount < text.length && (
        <span className="animate-pulse text-primary">|</span>
      )}
    </span>
  );
};

export default TypewriterText;
