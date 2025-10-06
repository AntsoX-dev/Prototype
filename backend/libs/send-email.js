import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SEND_GRID_API);

const fromEmail = process.env.FROM_EMAIL;

export const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: `Planifio <${fromEmail}>`,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("E-mail envoyé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur de l'envoi de l'e-mail:", error);
    return false;
  }
};

export default sendEmail;