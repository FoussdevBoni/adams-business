import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../utils/cn';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Décalage en secondes, pour échelonner des éléments voisins. */
  delay?: number;
}

/**
 * Apparition progressive au défilement (IntersectionObserver + transition CSS).
 * Sans IntersectionObserver, ou avec réduction des animations, le contenu est visible d'emblée.
 */
export function Reveal({ children, as: Tag = 'div', className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(
    () => typeof window === 'undefined' || !('IntersectionObserver' in window),
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Tag
      ref={ref}
      data-visible={visible}
      className={cn('reveal', className)}
      style={delay ? ({ '--reveal-delay': `${String(delay)}s` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
