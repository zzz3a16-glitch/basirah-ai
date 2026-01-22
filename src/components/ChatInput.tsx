import { FC, useState, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isActive = message.trim().length > 0 && !disabled;

  return (
    <div className="relative">
      <div className="glass-card rounded-2xl p-2 flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك الشرعي هنا..."
          disabled={disabled}
          className="flex-1 bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none min-h-[52px] max-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
          rows={1}
          style={{ direction: "rtl" }}
        />
        <button
          onClick={handleSend}
          disabled={!isActive}
          className={`shrink-0 mb-1 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            isActive 
              ? 'bg-gradient-to-br from-primary to-primary-hover text-white shadow-md hover:opacity-90 active:scale-95' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          aria-label="إرسال"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
