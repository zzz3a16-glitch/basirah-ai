import { FC, useState, useEffect } from "react";
import { X, Settings, User, Trash2 } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  onClearAllChats: () => void;
}

const SettingsDialog: FC<SettingsDialogProps> = ({ isOpen, onClose, userName, onUserNameChange, onClearAllChats }) => {
  const [name, setName] = useState(userName);

  useEffect(() => { setName(userName); }, [userName]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUserNameChange(name.trim() || "أنت");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] bg-card border border-border rounded-2xl z-[61] flex flex-col overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-foreground font-bold text-base">الإعدادات</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6" style={{ direction: "rtl" }}>
          {/* اسم المستخدم */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              اسم المستخدم
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm font-normal"
            />
          </div>

          {/* حذف جميع المحادثات */}
          <div className="space-y-2">
            <button
              onClick={() => { onClearAllChats(); onClose(); }}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              حذف جميع المحادثات
            </button>
            <p className="text-xs text-muted-foreground font-light">سيتم حذف جميع المحادثات غير المثبّتة نهائيًا.</p>
          </div>

          {/* زر الحفظ */}
          <button
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-bold hover:bg-primary-hover transition-colors"
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsDialog;
