import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`ui-card ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`ui-card-header ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => {
  return <h3 className={`ui-card-title ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`ui-card-content ${className}`}>{children}</div>;
};

export default Card;
