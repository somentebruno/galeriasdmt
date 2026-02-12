import React from 'react';

interface SectionProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onActionClick?: () => void;
    children: React.ReactNode;
    className?: string;
}

const Section: React.FC<SectionProps> = ({
    title,
    subtitle,
    actionLabel,
    onActionClick,
    children,
    className = ""
}) => {
    return (
        <section className={`mb-12 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                </div>
                {actionLabel && (
                    <button
                        onClick={onActionClick}
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
            {children}
        </section>
    );
};

export default Section;
