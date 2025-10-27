import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

const ANIMATION_PROPS = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
};

type PageTransitionProps = {
  children: ReactNode;
  routeKey: string;
};

export function PageTransition({ children, routeKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={routeKey} {...ANIMATION_PROPS} className="h-full w-full">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
