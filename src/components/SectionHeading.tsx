interface Props {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({ label, title, subtitle, align = 'center' }: Props) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
      {label && (
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-[#F5F7FA] text-[#0B1F3A] rounded-full border border-[#E5E7EB]">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-[#172033] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
