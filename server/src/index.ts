import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user-routes.js';
import taskRoutes from './routes/task-routes.js';
import handleError from './middleware/handle-error.js';
const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://zesty-optimism-production-b9c6.up.railway.app'
  ]
};

app.use(express.json()); // middleware function to parse requests
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);
app.use(handleError);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});