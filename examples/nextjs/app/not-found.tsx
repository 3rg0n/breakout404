'use client';

import { Breakout404 } from '@breakout404/react';

export default function NotFound() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Breakout404
        difficulty="medium"
        showScore={true}
        theme={{
          background: '#0a0a0a',
          paddle: '#00ff88',
          ball: '#ffffff',
          blocks: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
          text: '#ffffff',
        }}
        onComplete={() => {
          console.log('You destroyed the 404!');
        }}
      />
    </div>
  );
}
