import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { workRoutes } from './routes/work';
import { licenseRoutes } from './routes/license';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from public
app.use('/files', express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/work', workRoutes);
app.use('/api/license', licenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Work Licensing API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
