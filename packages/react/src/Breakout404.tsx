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

  // Store mutable callbacks in a ref so the game always calls the latest
  // version, even though the game instance is created once.
  const callbacksRef = useRef({
    onComplete: options.onComplete,
    onBlockDestroyed: options.onBlockDestroyed,
  });
  callbacksRef.current = {
    onComplete: options.onComplete,
    onBlockDestroyed: options.onBlockDestroyed,
  };

  // Create the game instance once on mount.
  useEffect(() => {
    if (!containerRef.current) return;

    gameRef.current = new Breakout404Game(containerRef.current, {
      ...options,
      onComplete: () => callbacksRef.current.onComplete?.(),
      onBlockDestroyed: (remaining) => callbacksRef.current.onBlockDestroyed?.(remaining),
    });

    return () => {
      gameRef.current?.destroy();
    };
  }, []);

  // Update config options when they change (difficulty, theme, redirect, etc.)
  // Function callbacks are handled via the ref above, so we exclude them.
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.updateOptions({
        theme: options.theme,
        difficulty: options.difficulty,
        showScore: options.showScore,
        redirectUrl: options.redirectUrl,
        redirectDelay: options.redirectDelay,
        logger: options.logger,
        onComplete: () => callbacksRef.current.onComplete?.(),
        onBlockDestroyed: (remaining) => callbacksRef.current.onBlockDestroyed?.(remaining),
      });
    }
  }, [
    options.difficulty,
    options.theme,
    options.showScore,
    options.redirectUrl,
    options.redirectDelay,
    options.logger,
  ]);

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
