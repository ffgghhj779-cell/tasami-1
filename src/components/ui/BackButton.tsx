import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  onClick?: () => void;
  to?: string | number;
  className?: string;
  'aria-label'?: string;
}

export function BackButton({
  onClick,
  to,
  className = '',
  'aria-label': ariaLabel = 'رجوع',
}: BackButtonProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (to !== undefined) {
      if (typeof to === 'number') navigate(to);
      else navigate(to);
      return;
    }
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 active:scale-95 shrink-0 ${className}`}
    >
      {i18n.dir() === 'rtl'
        ? <ChevronRight className="w-5 h-5 text-white" />
        : <ChevronLeft className="w-5 h-5 text-white" />}
    </button>
  );
}
