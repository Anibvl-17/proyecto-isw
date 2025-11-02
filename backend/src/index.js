import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectDb } from "./config/configDb";

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

// Inicia la conexión con la base de datos
connectDb()
  .then(() => {
    // Carga las rutas de la aplicación
    routerApi(app);

    // Levanta el servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`=> Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });
