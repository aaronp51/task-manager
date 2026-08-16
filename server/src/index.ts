import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user-routes.ts';
import taskRoutes from './routes/task-routes.ts';
import handleError from './middleware/handle-error.ts';
const app = express();

const corsOptions = {
  origin: 'https://zesty-optimism-production-b9c6.up.railway.app/'
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