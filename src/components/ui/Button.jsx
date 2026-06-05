const variantStyles = {
  primary: {
    background: "linear-gradient(135deg, #005eb8, #003087)",
    color: "white",
    border: "0",
    boxShadow: "0 12px 24px rgba(0, 94, 184, 0.22)",
  },
  secondary: {
    background: "white",
    color: "#003087",
    border: "1px solid #bfdbfe",
    boxShadow: "none",
  },
  danger: {
    background: "#b91c1c",
    color: "white",
    border: "0",
    boxShadow: "0 10px 20px rgba(185, 28, 28, 0.18)",
  },
  ghost: {
    background: "transparent",
    color: "#334155",
    border: "0",
    boxShadow: "none",
  },
};

const sizeStyles = {
  sm: {
    padding: "8px 12px",
    fontSize: "12px",
  },
  md: {
    padding: "12px 16px",
    fontSize: "14px",
  },
  lg: {
    padding: "14px 20px",
    fontSize: "16px",
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  style,
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-button ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: "16px",
        fontWeight: 950,
        lineHeight: 1,
        cursor: "pointer",
        transition: "all 0.15s ease",
        textDecoration: "none",
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}