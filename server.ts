import express from 'express';
import path from 'path';

async function startServer() {
  const app = express();
  // Cloud Run requires listening on process.env.PORT
  const PORT = process.env.PORT || 3000;

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Proxy Route
  app.get('/api/leads', async (req, res) => {
    try {
      console.log('Fetching leads from external API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s
      
      const response = await fetch('https://doableindia.com/api_data.php', { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`External API responded with status ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Proxy error (leads):', error.message);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch external data',
        details: error.message 
      });
    }
  });

  app.get('/api/tutors', async (req, res) => {
    try {
      console.log('Fetching tutors from external API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s

      const response = await fetch('https://doableindia.com/api_data_copy.php', { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`External API responded with status ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Tutors Proxy error:', error.message);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch tutors data',
        details: error.message
      });
    }
  });

  const distPath = path.join(process.cwd(), 'dist');

  if (process.env.NODE_ENV !== 'production') {
    // Dynamically import vite only in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
