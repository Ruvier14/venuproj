'use client';

import { useRouter } from 'next/navigation';

interface LogoProps {
  onClick?: () => void;
  className?: string;
}

export default function Logo({ onClick, className = '' }: LogoProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <button
      className={`logo-mark ${className}`}
      type="button"
      aria-label="Venu home"
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'flex-start',
      }}
    >
      <img src="/venu-logo.png" alt="Venu Logo" className="logo-icon" />
      <span
        style={{
          position: 'absolute',
          top: '8px',
          right: '-8px',
          fontSize: '10px',
          fontWeight: '400',
          color: '#666',
          lineHeight: '1',
          letterSpacing: '0.5px',
        }}
      >
        PH
      </span>
    </button>
  );
}

