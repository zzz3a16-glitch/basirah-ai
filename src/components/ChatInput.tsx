import { FC, useState, KeyboardEvent } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

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
        <Button
          variant="send"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="shrink-0 mb-1"
        >
          <Send className="w-4 h-4 rotate-180" />
        </Button>
      </div>
      <p className="text-center text-muted-foreground text-xs mt-3">
        بصيرة تلتزم بمنهج أهل السنة والجماعة وتعتمد على المصادر المعتمدة فقط
      </p>
    </div>
  );
};

export default ChatInput;
