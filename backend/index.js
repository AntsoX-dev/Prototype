import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import routes from "./routes/index.js"

dotenv.config();

const app = express();

//CORS frontend + tests
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["content-type", "Authorization"],
  })
);


app.use(morgan("dev"));
app.use(express.json());

// Vérifier que URI est bien lu
console.log("MONGODB_URI:", process.env.MONGODB_URI);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Base de données Connectée avec succès."))
  .catch((err) => {
    console.error("Échec de la connexion à la base de données.");
    console.error(err.message);
  });

//Route test 
app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Bienvenue Planifio API",
  });
});



// Route pour vérifier l'état de la connexion MongoDB
app.get("/health", (req, res) => {

  const state = mongoose.connection.readyState;

  let status;
  switch (state) {
    case 0: status = "disconnected"; break;
    case 1: status = "connected"; break;
    case 2: status = "connecting"; break;
    case 3: status = "disconnecting"; break;
  }

  res.json({ mongoStatus: status, readyState: state });
});



// routes principales
app.use("/api-v1", routes)

// errors globales
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
