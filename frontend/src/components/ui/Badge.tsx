import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "info",
  size = "md",
  className = "",
}) => {
  return (
    <span className={`ui-badge ui-badge-${variant} ui-badge-${size} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
