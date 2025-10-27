import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_DURATION = 1500;

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect system theme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeQuery.matches);

    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DURATION);

    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: isDark ? '#0A0C12' : '#FAFAFA',
        }}
      >
        <div className="text-4xl font-bold text-text-primary">
          Taizhunle
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
