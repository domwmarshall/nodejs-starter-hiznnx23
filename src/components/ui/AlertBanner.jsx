import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const tones = {
  danger: {
    icon: AlertTriangle,
    classes: "border-red-200 bg-red-50 text-red-900",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-orange-200 bg-orange-50 text-orange-900",
  },
  info: {
    icon: Info,
    classes: "border-blue-200 bg-blue-50 text-blue-900",
  },
  success: {
    icon: CheckCircle2,
    classes: "border-green-200 bg-green-50 text-green-900",
  },
};

export function AlertBanner({
  tone = "info",
  title,
  children,
  icon: CustomIcon,
  className = "",
}) {
  const toneConfig = tones[tone] || tones.info;
  const Icon = CustomIcon || toneConfig.icon;

  return (
    <section
      className={[
        "mb-6 flex items-start gap-3 rounded-3xl border p-4",
        toneConfig.classes,
        className,
      ].join(" ")}
    >
      <Icon size={22} className="mt-0.5 shrink-0" />
      <div>
        {title ? <strong className="block font-black">{title}</strong> : null}
        <div className="mt-1 text-sm font-bold leading-6">{children}</div>
      </div>
    </section>
  );
}