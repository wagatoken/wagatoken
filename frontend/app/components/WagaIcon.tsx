"use client";

interface WagaIconProps {
  children: React.ReactNode;
  variant?: 'coffee' | 'blockchain' | 'platform' | 'action' | 'status' | 'network';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function WagaIcon({ 
  children, 
  variant = 'platform', 
  size = 'sm',
  className = '' 
}: WagaIconProps) {
  const baseClasses = "inline-flex items-center justify-center font-bold tracking-wide border rounded transition-all duration-300 select-none whitespace-nowrap";
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm", 
    lg: "px-4 py-2 text-sm",
    xl: "px-6 py-3 text-base"
  };

  const variantClasses = {
    coffee: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-300",
    blockchain: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    platform: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
    action: "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
    status: "bg-green-50 text-green-800 border-green-200 hover:bg-green-100 hover:border-green-300",
    network: "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300"
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
