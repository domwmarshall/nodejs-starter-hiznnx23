export function Panel({ children, className = "", as: Component = "section" }) {
    return (
      <Component
        className={[
          "rounded-[28px] border border-[#d7e3f0] bg-white p-6",
          "shadow-[0_1px_3px_rgba(15,23,42,0.06),0_18px_42px_rgba(15,23,42,0.035)]",
          className,
        ].join(" ")}
      >
        {children}
      </Component>
    );
  }