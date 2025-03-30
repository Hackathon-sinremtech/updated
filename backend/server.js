const express = require("express");
const cors = require("cors");
require("dotenv").config();
const paymentRoutes = require("./routes/paymentRoutes");
const supabase = require("./config/supabase");
const rouAdmin = require("./routes/adminupdate")

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", paymentRoutes);

// API to Fetch Data
app.use("/",rouAdmin);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));