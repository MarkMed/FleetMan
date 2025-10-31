// /apps/backend/src/main.ts
// Punto de entrada del backend

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// TODO: Configurar rutas y middleware
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});