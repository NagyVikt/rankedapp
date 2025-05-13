'use client';

import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from '@heroui/react'; // Use HeroUI Button

// Combine ButtonProps with children
interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'isLoading'> {
  children: React.ReactNode;
}

export function SubmitButton({ children, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      isLoading={pending} // Use isLoading prop for HeroUI Button
      aria-disabled={pending}
      {...props} // Spread remaining props (like color, variant, fullWidth, etc.)
    >
      {children}
    </Button>
  );
}
