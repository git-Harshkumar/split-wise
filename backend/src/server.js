import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateIdempotencyKey } from './middleware/idempotency.js';
import peopleRoutes from './routes/people.js';
import groupsRoutes from './routes/groups.js';
import expensesRoutes from './routes/expenses.js';
import settlementsRoutes from './routes/settlements.js';
import balancesRoutes from './routes/balances.js';
import settingsRoutes from './routes/settings.js';
import exportRoutes from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const frontendUrl = process.env.FRONTEND_URL;

if (!supabaseUrl || !supabaseServiceRoleKey || !frontendUrl) {
  console.error('Missing required environment variables');
  process.exit(1);
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));

app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/people', authMiddleware, validateIdempotencyKey, peopleRoutes);
app.use('/api/groups', authMiddleware, validateIdempotencyKey, groupsRoutes);
app.use('/api/expenses', authMiddleware, validateIdempotencyKey, expensesRoutes);
app.use('/api/settlements', authMiddleware, validateIdempotencyKey, settlementsRoutes);
app.use('/api/balances', authMiddleware, balancesRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/export', authMiddleware, exportRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;