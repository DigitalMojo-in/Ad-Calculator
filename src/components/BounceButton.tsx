import React from 'react';
import { Button } from '@/components/ui/button';

interface BounceButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const BounceButton: React.FC<BounceButtonProps> = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`animate-[bounce_1s_ease-in-out_infinite] hover:animate-[pulse_1.5s_ease-in-out_infinite] 
                 hover:shadow-lg hover:shadow-primary/50 transform hover:scale-110 
                 transition-all duration-300 bg-red-600 hover:bg-red-700
                 text-white font-semibold ${className}`}
    >
      {children}
    </Button>
  );
};

export default BounceButton;