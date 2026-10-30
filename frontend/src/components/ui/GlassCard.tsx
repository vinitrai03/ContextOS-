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
      className={`bg-surface border border-border rounded-2xl p-6 relative overflow-hidden transition-all duration-200 ${
        glowOnHover ? 'hover:border-foreground/30 hover:shadow-minimal' : ''
      } ${activeBorder ? 'border-foreground/60 shadow-minimal' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
