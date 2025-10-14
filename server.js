const express = require('express');
const connectDb = require('./utils/dbConnector');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const cookieParser = require('cookie-parser');
const User = require('./models/userModel');

const app = express();
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 5000;
connectDb();

app.use('/api/notes', noteRoutes);
app.use('/api/auth', authRoutes);

/* const userRetrieval = async () => {
  console.log("start");
  const result = await User.find(); // try with and without await
  console.log(result);
  console.log("end");
}

userRetrieval(); */

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));