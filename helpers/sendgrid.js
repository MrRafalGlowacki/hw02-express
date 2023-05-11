import sgMail from "@sendgrid/mail";
import { config } from "./config.js";

export const sendVerificationEmail = ({ email, verificationToken }) => {
  sgMail.setApiKey(config.SENDGRID_API_KEY);
  const msg = {
    to: email, 
    from: "michalfacebook@kozacki.pl",
    subject: "Verify Your email",
    text: `
    Dear ${email},
    Thank you for registering on our website. 
    To complete the registration process, you need to verify your email address by copying and pasting it into your web browser:
    
    localhost:3000/api/users/verify/${verificationToken}
    
    Best regards,
    Customer Support Team`,
    html: `<html>
    <body>
      <p>Dear ${email},</p>
      <p>Thank you for registering on our website. To complete the registration process, you need to verify your email address by clicking on the link below:</p>
      <p><a href="http://localhost:3000/api/users/verify/${verificationToken}">click here</a></p>
      <p>Alternatively, you can copy and paste it into your web browser:</p>
      <p>localhost:3000/api/users/verify/${verificationToken}</p>
      <p>Best regards,</p>
      <p>Customer Support Team</p>
    </body>
  </html>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log(`Email to ${email} sent`);
    })
    .catch((error) => {
      console.error(error);
    });
};
