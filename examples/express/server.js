import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve static files from the pong404 core dist folder
app.use(
  '/pong404',
  express.static(join(__dirname, '../../packages/core/dist'))
);

// Example route
app.get('/', (req, res) => {
  res.send(`
    <h1>Express Pong404 Example</h1>
    <p>Visit <a href="/anything">/anything</a> to see the 404 game.</p>
  `);
});

// 404 handler with Pong404 game
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Page Not Found</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a0a; }
        #game { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="game"></div>
      <script type="module">
        import { Pong404Game } from '/pong404/pong404.mjs';

        new Pong404Game('#game', {
          difficulty: 'medium',
          showScore: true,
          theme: {
            background: '#0a0a0a',
            paddle: '#00ff88',
            ball: '#ffffff',
            blocks: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
            text: '#ffffff',
          },
          redirectUrl: '/',
          redirectDelay: 3000,
          onComplete: () => {
            console.log('Redirecting to home...');
          },
        });
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
