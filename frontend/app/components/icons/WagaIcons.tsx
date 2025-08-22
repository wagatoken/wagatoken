import React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Coffee Bean Icon - Unique to WAGA
export const CoffeeBeanIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3 6 1 1 2 2 3 3 1-1 2-2 3-3 1.5-1.5 3-3.5 3-6 0-3.5-2.5-6-6-6z"
      fill={color}
      opacity="0.9"
    />
    <path
      d="M12 6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2z"
      fill="rgba(255,255,255,0.3)"
    />
  </svg>
);

// Blockchain Verification Icon
export const VerificationIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="6" width="4" height="4" rx="1" fill={color} opacity="0.8" />
    <rect x="10" y="6" width="4" height="4" rx="1" fill={color} opacity="0.8" />
    <rect x="18" y="6" width="4" height="4" rx="1" fill={color} opacity="0.8" />
    <rect x="2" y="14" width="4" height="4" rx="1" fill={color} opacity="0.8" />
    <rect x="10" y="14" width="4" height="4" rx="1" fill={color} opacity="0.8" />
    <rect x="18" y="14" width="4" height="4" rx="1" fill={color} opacity="0.8" />
    
    {/* Connection lines */}
    <line x1="6" y1="8" x2="10" y2="8" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="14" y1="8" x2="18" y2="8" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="6" y1="16" x2="10" y2="16" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="14" y1="16" x2="18" y2="16" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="4" y1="10" x2="4" y2="14" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="12" y1="10" x2="12" y2="14" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="20" y1="10" x2="20" y2="14" stroke={color} strokeWidth="2" opacity="0.6" />
    
    {/* Checkmark overlay */}
    <path
      d="M9 12l2 2 4-4"
      stroke="rgba(34, 197, 94, 0.9)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Farm/Origin Icon
export const FarmOriginIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Mountains */}
    <path
      d="M2 20l4-8 3 6 3-6 3 6 3-6 4 8H2z"
      fill={color}
      opacity="0.3"
    />
    {/* Ethiopian highlands */}
    <path
      d="M6 16l2-4 2 4M14 16l2-4 2 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Coffee plants */}
    <circle cx="8" cy="6" r="2" fill="rgba(34, 197, 94, 0.7)" />
    <circle cx="16" cy="8" r="1.5" fill="rgba(34, 197, 94, 0.7)" />
    <circle cx="12" cy="4" r="1.5" fill="rgba(34, 197, 94, 0.7)" />
  </svg>
);

// Quality Grade Icon
export const QualityGradeIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Award base */}
    <circle cx="12" cy="10" r="8" fill={color} opacity="0.1" />
    <circle cx="12" cy="10" r="6" fill={color} opacity="0.2" />
    <circle cx="12" cy="10" r="4" fill={color} opacity="0.8" />
    
    {/* Star */}
    <path
      d="M12 6l1.5 3h3l-2.4 1.8.9 2.8L12 12l-2.4 1.6.9-2.8L8 8h3L12 6z"
      fill="rgba(255, 255, 255, 0.9)"
    />
    
    {/* Ribbons */}
    <path
      d="M8 16l4 2 4-2v6l-4-2-4 2v-6z"
      fill={color}
      opacity="0.6"
    />
  </svg>
);

// IPFS Storage Icon (Coffee-themed)
export const CoffeeStorageIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Storage container */}
    <rect x="4" y="6" width="16" height="12" rx="2" fill={color} opacity="0.2" />
    <rect x="6" y="8" width="12" height="8" rx="1" fill={color} opacity="0.1" />
    
    {/* Coffee beans inside */}
    <circle cx="9" cy="11" r="1" fill={color} opacity="0.7" />
    <circle cx="12" cy="13" r="1" fill={color} opacity="0.7" />
    <circle cx="15" cy="11" r="1" fill={color} opacity="0.7" />
    
    {/* IPFS nodes */}
    <circle cx="4" cy="4" r="2" fill={color} opacity="0.8" />
    <circle cx="20" cy="4" r="2" fill={color} opacity="0.8" />
    <circle cx="4" cy="20" r="2" fill={color} opacity="0.8" />
    <circle cx="20" cy="20" r="2" fill={color} opacity="0.8" />
    
    {/* Connection lines */}
    <line x1="6" y1="4" x2="18" y2="4" stroke={color} strokeWidth="1" opacity="0.5" />
    <line x1="4" y1="6" x2="4" y2="18" stroke={color} strokeWidth="1" opacity="0.5" />
    <line x1="20" y1="6" x2="20" y2="18" stroke={color} strokeWidth="1" opacity="0.5" />
    <line x1="6" y1="20" x2="18" y2="20" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

// Traceability Chain Icon
export const TraceabilityIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Chain links with coffee context */}
    <ellipse cx="6" cy="8" rx="4" ry="2" fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
    <ellipse cx="12" cy="12" rx="4" ry="2" fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
    <ellipse cx="18" cy="16" rx="4" ry="2" fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
    
    {/* Coffee bean progression */}
    <circle cx="6" cy="8" r="1" fill="rgba(139, 69, 19, 0.8)" />
    <circle cx="12" cy="12" r="1" fill="rgba(160, 82, 45, 0.8)" />
    <circle cx="18" cy="16" r="1" fill="rgba(101, 67, 33, 0.8)" />
    
    {/* Connecting arrows */}
    <path
      d="M8 9l2 1.5M14 13l2 1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

// Distributor Network Icon
export const DistributorNetworkIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Central hub */}
    <circle cx="12" cy="12" r="3" fill={color} opacity="0.8" />
    
    {/* Distributor nodes */}
    <circle cx="6" cy="6" r="2" fill={color} opacity="0.6" />
    <circle cx="18" cy="6" r="2" fill={color} opacity="0.6" />
    <circle cx="6" cy="18" r="2" fill={color} opacity="0.6" />
    <circle cx="18" cy="18" r="2" fill={color} opacity="0.6" />
    
    {/* Connection lines */}
    <line x1="8" y1="8" x2="10" y2="10" stroke={color} strokeWidth="2" opacity="0.5" />
    <line x1="16" y1="8" x2="14" y2="10" stroke={color} strokeWidth="2" opacity="0.5" />
    <line x1="8" y1="16" x2="10" y2="14" stroke={color} strokeWidth="2" opacity="0.5" />
    <line x1="16" y1="16" x2="14" y2="14" stroke={color} strokeWidth="2" opacity="0.5" />
    
    {/* Coffee shop indicators */}
    <rect x="5" y="5" width="2" height="2" rx="0.5" fill="rgba(255, 255, 255, 0.8)" />
    <rect x="17" y="5" width="2" height="2" rx="0.5" fill="rgba(255, 255, 255, 0.8)" />
    <rect x="5" y="17" width="2" height="2" rx="0.5" fill="rgba(255, 255, 255, 0.8)" />
    <rect x="17" y="17" width="2" height="2" rx="0.5" fill="rgba(255, 255, 255, 0.8)" />
  </svg>
);

// Batch Creation Icon
export const BatchCreationIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Coffee bag */}
    <path
      d="M7 8h10c1 0 2 1 2 2v8c0 1-1 2-2 2H7c-1 0-2-1-2-2v-8c0-1 1-2 2-2z"
      fill={color}
      opacity="0.3"
    />
    
    {/* Plus symbol for creation */}
    <line x1="12" y1="6" x2="12" y2="18" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="3" strokeLinecap="round" />
    
    {/* Coffee beans */}
    <circle cx="10" cy="14" r="1" fill="rgba(139, 69, 19, 0.8)" />
    <circle cx="14" cy="16" r="1" fill="rgba(139, 69, 19, 0.8)" />
    
    {/* Blockchain element */}
    <rect x="16" y="4" width="4" height="4" rx="1" fill={color} opacity="0.6" />
  </svg>
);

export default {
  CoffeeBeanIcon,
  VerificationIcon,
  FarmOriginIcon,
  QualityGradeIcon,
  CoffeeStorageIcon,
  TraceabilityIcon,
  DistributorNetworkIcon,
  BatchCreationIcon,
};
