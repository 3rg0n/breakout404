import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Breakout404 Next.js Example</h1>
      <p>
        Visit a <Link href="/nonexistent-page">non-existent page</Link> to see
        the 404 game.
      </p>
    </div>
  );
}
