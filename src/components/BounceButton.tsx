
import React from 'react';
import { Button } from '@/components/ui/button';

interface BounceButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

export const BounceButton: React.FC<BounceButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
  disabled = false,
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      className={`hover-target animate-bounce-gentle hover:animate-bounce-stop transition-all duration-300 ease-out transform hover:scale-105 ${className}`}
      style={{
        animationDuration: '2s',
        animationIterationCount: 'infinite',
      }}
    >
      {children}
    </Button>
  );
};
