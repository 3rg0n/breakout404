import React, { useEffect, useRef } from 'react';
import { Pong404Game, type Pong404Options } from '@pong404/core';

export interface Pong404Props extends Pong404Options {
  className?: string;
  style?: React.CSSProperties;
}

export function Pong404({ className, style, ...options }: Pong404Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Pong404Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gameRef.current = new Pong404Game(containerRef.current, options);

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

export default Pong404;
