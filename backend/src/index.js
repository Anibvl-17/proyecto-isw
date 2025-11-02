import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();
app(express.json());
app.use(morgan("dev"));

// Para permitir peticiones del frontend
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.get("/", (req, res) => {
  res.send("Bienvenido al sistema de inscripción de electivo.");
});
