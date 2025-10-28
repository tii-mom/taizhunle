import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onClick?: () => void;
};

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
};

export function Logo({ size = 'md', animated = true, onClick }: Props) {
  const { t } = useTranslation('brand');
  const [key, setKey] = useState(0);

  const handleClick = () => {
    if (animated) {
      setKey((prev) => prev + 1);
    }
    onClick?.();
  };

  return (
    <motion.button
      key={key}
      type="button"
      onClick={handleClick}
      initial={animated ? { scale: 1.1, rotate: 12 } : false}
      animate={animated ? { scale: 1, rotate: 0 } : false}
      transition={animated ? { duration: 0.6, type: 'spring', bounce: 0.4 } : undefined}
      className={`flex items-center justify-center overflow-hidden rounded-full transition-transform hover:scale-105 active:scale-95 ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      aria-label={t('logo')}
    >
      <img 
        src="/logo.svg" 
        alt={t('logo')} 
        className="h-full w-full object-cover logo-live"
        style={{
          transform: 'scale(1.3)',
          objectPosition: 'center'
        }}
      />
    </motion.button>
  );
}
