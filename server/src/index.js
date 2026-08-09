const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: 'https://zesty-optimism-production-b9c6.up.railway.app/'
};

app.use(express.json()); // middleware function to parse requests
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});