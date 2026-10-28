import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
  activeBorder?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowOnHover = true,
  activeBorder = false,
  ...props
}) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
        glowOnHover ? 'glass-panel-hover' : ''
      } ${activeBorder ? 'border-brand-DEFAULT/40 shadow-glow-indigo' : ''} ${className}`}
      {...props}
    >
      {/* Subtle top light reflection beam */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
