import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  routeKey: string;
};

export function PageTransition({ children, routeKey }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
