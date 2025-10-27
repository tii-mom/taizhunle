import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import lottie, { type AnimationItem } from 'lottie-web';

type EmptyType = 'market' | 'redPacket' | 'profile';

type Props = {
  type: EmptyType;
  className?: string;
};

const lottieFiles: Record<EmptyType, string> = {
  market: '/lottie-empty-market.json',
  redPacket: '/lottie-empty-redpacket.json',
  profile: '/lottie-empty-profile.json',
};

export function EmptyState({ type, className = '' }: Props) {
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: lottieFiles[type],
    });

    return () => {
      animationRef.current?.destroy();
    };
  }, [type]);

  useEffect(() => {
    if (!animationRef.current) return;

    if (isHovered) {
      animationRef.current.pause();
    } else {
      animationRef.current.play();
    }
  }, [isHovered]);

  return (
    <article
      className={`flex flex-col items-center gap-4 rounded-xl border border-light bg-surface-glass/60 p-10 text-center shadow-2xl backdrop-blur-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className="h-32 w-32 transition-transform duration-300 hover:scale-105"
      />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">
          {t(`empty.${type}.title`)}
        </h3>
        <p className="text-sm text-text-secondary">
          {t(`empty.${type}.description`)}
        </p>
      </div>
    </article>
  );
}
