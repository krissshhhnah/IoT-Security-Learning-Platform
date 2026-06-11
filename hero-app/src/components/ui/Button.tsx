import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-xs font-bold tracking-widest uppercase transition-all duration-300 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-red font-mono";
    
    const variants = {
      primary: "bg-neon-red text-ink border-none shadow-[0_0_18px_rgba(255,31,31,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,31,31,0.5)]",
      secondary: "bg-ink/50 backdrop-blur-md text-ghost border border-slate-2 font-medium tracking-normal hover:border-neon-red-border hover:text-neon-red hover:bg-neon-red/5",
      ghost: "bg-transparent text-mist hover:text-neon-red hover:bg-neon-red/10 border border-transparent",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
