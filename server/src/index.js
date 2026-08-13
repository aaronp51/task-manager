const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user-routes.js');
const taskRoutes = require('./routes/task-routes.js');
const handleError = require('./middleware/handle-error.js');
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