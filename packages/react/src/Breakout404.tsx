import React, { useEffect, useRef } from 'react';
import { Breakout404Game, type Breakout404Options } from '@3rg0n/breakout404-core';

export interface Breakout404Props extends Breakout404Options {
  className?: string;
  style?: React.CSSProperties;
}

export function Breakout404({
  className,
  style,
  ...options
}: Breakout404Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Breakout404Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gameRef.current = new Breakout404Game(containerRef.current, options);

    return () => {
      gameRef.current?.destroy();
    };
  }, []);

  // Update options when they change
  useEffect(() => {
    if (gameRef.current) {
      // For now, reset the game when options change
      // A more sophisticated approach would update individual settings
      gameRef.current.reset();
    }
  }, [options.difficulty, options.theme]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        ...style,
      }}
    />
  );
}

export default Breakout404;
