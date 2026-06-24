const ejs = require("ejs");
const path = require("path");
const { sendEmail } = require("../utils/mailer");

/**
 * POST /contact
 * Sends a contact form email to the site owner.
 * Body: { fullname, email, subject, message }
 */
async function sendBlessingPortfolioContactEmail(req, res, next) {
  try {
    console.log(req.body);
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required: name, email, subject, message.",
      });
    }

    const templatePath = path.join(__dirname, "../views/emails/contact.ejs");
    const html = await ejs.renderFile(templatePath, {
      name,
      email,
      subject,
      message,
    });

    await sendEmail({
      to: process.env.CONTACT_RECEIVER_EMAIL || process.env.MAIL_USER,
      subject: `[Blessing Portfolio] ${subject}`,
      html,
      from: `"${name}" <${process.env.MAIL_USER}>`,
    });

    return res
      .status(200)
      .json({ message: "Your message has been sent successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = { sendBlessingPortfolioContactEmail };
