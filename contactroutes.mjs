import express from "express";
import nodemailer from "nodemailer";
import bodyparser from "body-parser";


const router = express.Router();

router.post('/', (req, res) => {
    const { name, email, message } = req.body;

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: "Gmail",
    auth: {
        user: 'kupchikreuvi@gmail.com',
        pass: 'twgd vpfg ovns wskc'
    }
    });

    // Email message options
    const mailOptions = {
        from: 'kupchikreuvi@gmail.com',
        to: 'kupchikreuvi@gmail.com',
        subject: `Message from ${name} - ${email}`,
        text: message
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
	    console.log(`Message from ${name} - ${email}`);
            res.status(500).json({ message: 'Failed to send email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ message: 'Email sent successfully' });
        }
    });
});

export default router;
