import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${variant === 'primary' ? 'bg-sovereign-accent-cyan text-black hover:bg-cyan-300' :
                        variant === 'secondary' ? 'bg-sovereign-card text-white hover:bg-white/10' :
                            'border border-sovereign-border text-white hover:bg-white/5'
                    } ${className}`}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
