import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    icon?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30',
        secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
        outline: 'bg-transparent border border-slate-200 dark:border-slate-700 text-primary hover:bg-slate-50 dark:hover:bg-slate-700',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2'
    };

    const sizes = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-5 py-2.5',
        lg: 'px-8 py-3.5 text-lg'
    };

    const variantStyle = variant === 'ghost' ? variants.ghost : `${variants[variant]} ${sizes[size]}`;

    return (
        <button className={`${baseStyles} ${variantStyle} ${className}`} {...props}>
            {icon && <span className="material-icons-outlined text-lg">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;
