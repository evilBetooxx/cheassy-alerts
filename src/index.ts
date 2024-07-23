import express from "express";
import brevo from "@getbrevo/brevo";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3003;

app.use(express.json());

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY ||
    "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"
);

// MongoDB connection
const mongoUri =
  process.env.MONGO_URI ||
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

    if (!email || !firstName) {
      return res
        .status(400)
        .json({
          message: "Se requiere email y firstName en el cuerpo de la solicitud",
        });
    }

    const sendSmtpEMail = new brevo.SendSmtpEmail();

    sendSmtpEMail.subject = "Alerta de parámetros Cheassy";
    sendSmtpEMail.to = [{ email: email, name: firstName }];
    sendSmtpEMail.htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            h1 { color: #2c3e50; }
            .alert { background-color: #e74c3c; color: white; padding: 10px; border-radius: 5px; }
            .footer { margin-top: 20px; font-size: 0.8em; color: #7f8c8d; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Alerta de Parámetros Cheassy</h1>
            <p>Hola ${firstName},</p>
            <p>Se ha detectado una alerta en los parámetros de tu cuenta Cheassy.</p>
            <div class="alert">
              <p><strong>Mensaje de alerta:</strong> Se requiere tu atención inmediata.</p>
            </div>
            <p>Por favor, ingresa a tu cuenta Cheassy para revisar los detalles y tomar las acciones necesarias.</p>
            <p>Si necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.</p>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>© 2024 Cheassy. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    sendSmtpEMail.sender = {
      name: "Cheassy Support",
      email: "223201@ids.upchiapas.edu.mx",
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEMail);
    console.log(result);
    res.status(200).json({ message: "Alerta enviada exitosamente", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar la alerta", error });
  }
});

// Nuevo endpoint para obtener datos del queso
app.get("/cheese/:id", async (req, res) => {
  try {
    const cheeseId = req.params.id;

    const database = client.db("cheassy");
    const collection = database.collection("Data");

    const cheeseData = await collection
      .find({ cheeseId: new ObjectId(cheeseId) })
      .sort({ timestamp: 1 })
      .toArray();

    res.json(cheeseData);
  } catch (error: any) {
    console.error("Error al obtener datos del queso:", error);
    res
      .status(500)
      .json({
        message: "Error al obtener datos del queso",
        error: error.message,
      });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
