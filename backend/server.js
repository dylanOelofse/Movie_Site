//npm install express
//npm install cors

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import reviews from "./api/reviews.route.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/v1/reviews", reviews);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use("*", (req, res) => res.status(404).json({ error: "Not found." }));

export default app;
