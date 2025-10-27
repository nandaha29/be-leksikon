import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cultureRoutes from './routes/admin/culture.routes.js'; 
import contributorRoutes from '@/routes/admin/contributor.routes.js';
import referensiRoutes from '@/routes/admin/reference.routes.js';
import assetRoutes from '@/routes/admin/asset.routes.js';
import subcultureRoutes from './routes/admin/subculture.routes.js';
import domainKodifikasiRoutes from './routes/admin/domainKodifikasi.routes.js';
import leksikonRoutes from '@/routes/admin/leksikon.routes.js';

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads

// A simple test route
app.get('/api', (req: Request, res: Response) => {
  res.send('Leksikon Backend API is running!');
});

// Use the culture routes
app.use('/api/v1/cultures', cultureRoutes);
app.use('/api/v1/contributors', contributorRoutes);
app.use('/api/v1/referensi', referensiRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use("/api/v1/subcultures", subcultureRoutes);
app.use("/api/v1/domain-kodifikasi", domainKodifikasiRoutes);
app.use('/api/v1/leksikons', leksikonRoutes);
app.use("/api/v1/cultures", subcultureRoutes);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});