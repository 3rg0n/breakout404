package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed static/*
var staticFiles embed.FS

const notFoundHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%%; height: 100%%; overflow: hidden; background: #0a0a0a; }
    #game { width: 100%%; height: 100%%; }
  </style>
</head>
<body>
  <div id="game"></div>
  <script type="module">
    import { Breakout404Game } from '/static/breakout404.mjs';

    new Breakout404Game('#game', {
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
</html>`

func main() {
	// Serve embedded static files
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.FS(staticFS))))

	// Home page
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			// 404 handler
			w.WriteHeader(http.StatusNotFound)
			w.Header().Set("Content-Type", "text/html")
			fmt.Fprint(w, notFoundHTML)
			return
		}

		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, `
			<h1>Go Breakout404 Example</h1>
			<p>Visit <a href="/anything">/anything</a> to see the 404 game.</p>
		`)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running at http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
