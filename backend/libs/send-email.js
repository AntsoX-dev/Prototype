import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // doit être false pour le port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Planifio" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("E-mail envoyé avec succès à :", to);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error.message);
    return false;
  }
};

export default sendEmail;
