import { FC } from "react";
import { X, Shield } from "lucide-react";

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyDialog: FC<PrivacyDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] md:max-h-[80vh] bg-card border border-border rounded-2xl z-[61] flex flex-col overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-foreground font-bold text-base">سياسة الخصوصية</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-foreground/85 text-sm leading-relaxed font-light" style={{ direction: "rtl" }}>
          <section>
            <h3 className="font-bold text-foreground mb-2">مقدمة</h3>
            <p>
              نلتزم في «بصيرة» بحماية خصوصيتك. يوضح هذا البيان كيفية تعاملنا مع بياناتك عند استخدامك للتطبيق.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">البيانات التي نجمعها</h3>
            <p>
              لا نجمع أي بيانات شخصية تعريفية. الأسئلة التي تطرحها تُعالج للحصول على الإجابة فقط ولا تُخزّن على خوادمنا بشكل دائم.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">التخزين المحلي</h3>
            <p>
              يتم حفظ سجل المحادثات محليًا على جهازك فقط (عبر المتصفح)، ويمكنك حذفه في أي وقت. لا نملك صلاحية الوصول إلى هذه البيانات.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">الأمان</h3>
            <p>
              نستخدم اتصالات مشفرة (HTTPS) لحماية البيانات أثناء النقل. نحرص على اتباع أفضل الممارسات الأمنية.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">تواصل معنا</h3>
            <p>
              إذا كان لديك أي استفسار حول سياسة الخصوصية، يُرجى التواصل معنا عبر التطبيق.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyDialog;
