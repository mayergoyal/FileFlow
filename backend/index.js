const express=require('express');
const nodemailer=require('nodemailer');
const mongoose=require('mongoose');
const cors=require('cors')
require('dotenv').config();
const app=express();
app.use(express.json());
app.use(cors());
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected");
  })
  .catch((err) => console.error(err));
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  course: String,
  year: String,
  files: Number,
});
const User=mongoose.model('User',userSchema);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  headers: {
    "Content-Type": "text/html; charset=UTF-8",
  },
});
app.post("/submit", async (req, res) => {
  const { name, email, course, year, files } = req.body;

  // Save the user data in MongoDB
  const user = new User({ name, email, course, year, files });
  await user.save();

  // Send a confirmation email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmation Email",
    html: `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: rgb(30, 48, 21); color: white; line-height: 1.6; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <img src="https://drive.google.com/uc?id=1B9jGeAweFwk1swOLuDyz2ruNA45OXc5X" alt="Your Image" style="width: 100%; max-width: 400px; border-radius: 10px; margin-top: 20px;" />
      <h2>Hello <b>${name}</b>,</h2>
      <p>Your details have been submitted successfully! Here are your details:</p>
      <ul style="text-align: left;">
        <li><b>Name:</b> ${name}</li>
        <li><b>Course:</b> ${course}</li>
        <li><b>Year:</b> ${year || "N/A"}</li>
        <li><b>Files:</b> ${files || 0}</li>
      </ul>
      <p>
        <b>Team Green Team Bliss</b> has been working in the direction of sustainable and more inclusive environment-friendly activities, and <b>File Flow</b> is one of them.
      </p>
      <p>
        Your support and time means a lot ✨✨. Hope you continue thinking about the environment because this environment does...
      </p>
      <p style="color: red; font-weight: bold;">Thank you 🙏🏻!</p>
    </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Error sending email");
    }
    res.status(200).send("Form submitted and email sent");
  });
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});