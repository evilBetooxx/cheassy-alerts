import express from "express";
import brevo from "@getbrevo/brevo";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3003;

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "PREFLIGHT"],
    credentials: true,
  })
);

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
    "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"
);

// MongoDB connection
const mongoUri =
  "mongodb+srv://admin:admin123@cheassy.q9xcy9y.mongodb.net/cheassy?retryWrites=true&w=majority";
const client = new MongoClient(mongoUri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

connectToMongo();

app.post("/alert", async (req, res) => {
  try {
    const { email, firstName } = req.body;
    console.log(email, firstName);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Alerta de parámetros Cheassy";
    sendSmtpEmail.to = [{ email: email, name: firstName }];
    sendSmtpEmail.htmlContent = "<body><h1>Alerta de parámetros Cheassy</h1></body>";

    sendSmtpEmail.sender = {
      name: "Cheassy Support",
      email: "betooxx.dev@gmail.com",
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.status(200).json({ message: "Alerta enviada exitosamente", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar la alerta" });
  }
});

// Nuevo endpoint para obtener datos históricos del queso
app.get("/cheese/:id", async (req, res) => {
  try {
    const cheeseId = req.params.id;
    console.log("ID del queso:", cheeseId);

    const database = client.db("cheassy");
    const collection = database.collection("Data");

    const cheeseData = await collection
      .find({ cheeseId: cheeseId })
      .sort({ timestamp: -1 }) // Ordenar de más reciente a más antiguo
      .toArray();

    console.log("Datos históricos del queso:", cheeseData);
    res.json(cheeseData);
  } catch (error: any) {
    console.error("Error al obtener datos históricos del queso:", error);
    res.status(500).json({
      message: "Error al obtener datos históricos del queso",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
