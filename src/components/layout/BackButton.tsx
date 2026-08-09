'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  onClick,
  href,
  className = '',
}) => {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-95 transition-all shadow-sm ${className}`}
      >
        <ArrowLeft className="h-4 w-4 text-blue-600 shrink-0" />
        <span>{label}</span>
      </Link>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-95 transition-all shadow-sm ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4 text-blue-600 shrink-0" />
      <span>{label}</span>
    </button>
  );
};
