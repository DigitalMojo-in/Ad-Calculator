import React from 'react';
import { Button } from '@/components/ui/button';

interface BounceButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const BounceButton: React.FC<BounceButtonProps> = ({ children, onClick, className = '' }) => {
  return (
    <Button
      onClick={onClick}
      className={`animate-bounce-custom hover:animate-none transition-all duration-300 hover:scale-105 ${className}`}
      style={{
        animation: 'bounce-custom 2s infinite',
      }}
    >
      {children}
    </Button>
  );
};

export default BounceButton;