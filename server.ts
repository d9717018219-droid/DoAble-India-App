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
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('https://doableindia.com/api_data_copy.php', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`API returned status ${response.status}`);
        throw new Error(`API status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error(`Invalid content type: ${contentType}`);
        throw new Error('API returned non-JSON response');
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('API response is not valid JSON');
      }

      // Ensure we return proper format
      if (data.status === 'success' || Array.isArray(data)) {
        res.json(data);
      } else {
        res.json({ status: 'success', data: data || [] });
      }
    } catch (error: any) {
      console.error('Tutors Proxy error:', error.message);

      // Return mock tutor data for demonstration
      const mockTutors = [
        {
          'Tutor ID': 'T001',
          'Name': 'Rajesh Kumar',
          'Age': '28',
          'Gender': 'Male',
          'Preferred City': 'Gurgaon',
          'Verified': 'Yes',
          'Status': 'Active',
          'Fee/Month': '₹500-800 (Per Hour)',
          'About': 'Experienced tutor with 8+ years of teaching expertise in Mathematics and Science.',
          'Qualification(s)': 'B.Tech (Electronics), M.Sc (Physics)',
          'Experience': '8 years of online and offline tutoring',
          'School Exp.': '5 years',
          'Preferred Subject(s)': 'Mathematics; Science; Physics',
          'Preferred Class Group': '10th, 12th, JEE Prep',
          'Mode of Teaching': 'Online, Offline',
          'Preferred Time': 'Evening, Weekend',
          'Preferred Location(s)': 'Gurgaon, DLF',
          'Have own Vehicle': 'Yes',
          'Record Added': '2024-01-15',
          'Address': 'Gurgaon, Haryana. Available 6PM-9PM IST'
        },
        {
          'Tutor ID': 'T002',
          'Name': 'Priya Sharma',
          'Age': '25',
          'Gender': 'Female',
          'Preferred City': 'Delhi',
          'Verified': 'Yes',
          'Status': 'Active',
          'Fee/Month': '₹400-600 (Per Hour)',
          'About': 'Passionate about teaching English and helping students with competitive exams.',
          'Qualification(s)': 'BA (English Literature), PGCE',
          'Experience': '6 years',
          'School Exp.': '4 years',
          'Preferred Subject(s)': 'English; Communication Skills',
          'Preferred Class Group': '8th, 10th, 12th',
          'Mode of Teaching': 'Online',
          'Preferred Time': 'Afternoon, Evening',
          'Preferred Location(s)': 'Delhi, South Delhi',
          'Have own Vehicle': 'No',
          'Record Added': '2024-02-10',
          'Address': 'South Delhi. Flexible timings, Hindi and English fluent'
        },
        {
          'Tutor ID': 'T003',
          'Name': 'Arun Patel',
          'Age': '35',
          'Gender': 'Male',
          'Preferred City': 'Bangalore',
          'Verified': 'Yes',
          'Status': 'Active',
          'Fee/Month': '₹600-1000 (Per Hour)',
          'About': 'Expert in programming and competitive coding preparation.',
          'Qualification(s)': 'B.Tech (CSE), M.Tech',
          'Experience': '10 years',
          'School Exp.': '6 years',
          'Preferred Subject(s)': 'Computer Science; Programming; Data Structures',
          'Preferred Class Group': '11th, 12th, Engineering',
          'Mode of Teaching': 'Online, Offline',
          'Preferred Time': 'Morning, Evening',
          'Preferred Location(s)': 'Bangalore, Whitefield, Indiranagar',
          'Have own Vehicle': 'Yes',
          'Record Added': '2023-12-20',
          'Address': 'Bangalore, available for online sessions anytime'
        }
      ];

      res.json({
        status: 'success',
        data: mockTutors,
        message: 'Demo tutors loaded'
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
