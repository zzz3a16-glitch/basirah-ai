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

        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-foreground/85 text-sm leading-relaxed font-light" style={{ direction: "rtl" }}>
          <section>
            <h3 className="font-bold text-foreground mb-2">مقدمة</h3>
            <p>
              مرحبًا بك في تطبيق «بصيرة» – مساعدك الذكي في العلوم الشرعية. نحرص على حماية خصوصيتك واحترام بياناتك الشخصية وفقًا لأفضل المعايير والممارسات المعمول بها.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">البيانات التي نجمعها</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>معلومات الحساب: البريد الإلكتروني والاسم عند التسجيل.</li>
              <li>المحادثات: تُحفظ أسئلتك وإجاباتها لتتمكن من الرجوع إليها لاحقًا.</li>
              <li>لا نجمع بيانات الموقع الجغرافي أو بيانات الاتصال أو الملفات الشخصية.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">كيف نستخدم بياناتك</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>لتقديم الإجابات الشرعية بناءً على أسئلتك.</li>
              <li>لحفظ سجل المحادثات وإتاحة استرجاعها عند تسجيل الدخول.</li>
              <li>لتحسين جودة الخدمة وتطوير التطبيق.</li>
              <li>لا نبيع أو نشارك بياناتك مع أي أطراف خارجية لأغراض تجارية.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">حماية البيانات</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>نستخدم اتصالات مشفرة (HTTPS/TLS) لحماية البيانات أثناء النقل.</li>
              <li>يتم تخزين كلمات المرور بشكل مشفر ولا يمكن لأي شخص الاطلاع عليها.</li>
              <li>نطبق سياسات أمان على مستوى قاعدة البيانات (RLS) لضمان وصول كل مستخدم لبياناته فقط.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">حقوقك</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>يحق لك حذف حسابك وجميع بياناتك في أي وقت.</li>
              <li>يمكنك حذف أي محادثة بشكل فوري ودائم.</li>
              <li>يحق لك طلب نسخة من بياناتك المخزنة.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">الاستخدام بدون تسجيل</h3>
            <p>
              يمكنك استخدام التطبيق بدون إنشاء حساب. في هذه الحالة، تُحفظ المحادثات محليًا على جهازك فقط (عبر المتصفح) ولا نملك صلاحية الوصول إليها. ستفقد هذه البيانات عند مسح بيانات المتصفح.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">إخلاء المسؤولية الشرعية</h3>
            <p>
              «بصيرة» أداة مساعدة تعتمد على الذكاء الاصطناعي. لا يُعد المحتوى المقدم فتوى شرعية رسمية. يُنصح دائمًا بالرجوع إلى عالم شرعي مختص في المسائل المعقدة أو الشخصية.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-2">التواصل</h3>
            <p>
              لأي استفسار أو ملاحظة حول سياسة الخصوصية، يُرجى التواصل معنا عبر التطبيق.
            </p>
          </section>

          <p className="text-xs text-muted-foreground text-center pt-3 border-t border-border/30">
            آخر تحديث: فبراير 2026
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyDialog;
