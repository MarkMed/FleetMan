import React from "react";
import { cn } from "@utils/cn";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 32, className }) => {
  const dimension = `${size}px`;
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-primary border-t-transparent",
        className
      )}
      style={{ width: dimension, height: dimension }}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    />
  );
};
