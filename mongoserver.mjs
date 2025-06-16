import express from "express";
import cors from "cors";
import "express-async-errors";
import shiurimroutes from "./shiurimroutes.mjs";
import contactroutes from "./contactroutes.mjs";
import userRoutes from "./userRoutes.mjs";
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static('public'));

app.use(cors());
app.use(express.json());


// Routes
app.use("/shiurim", shiurimroutes);
app.use("/contact", contactroutes);
app.use("/users", userRoutes);

// Global error handling
app.use((err, _req, res, next) => {
  console.error(err.stack); 
  res.status(500).send("Uh oh! An unexpected error occurred.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});