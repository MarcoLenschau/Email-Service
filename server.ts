import type { Request, Response } from 'express';
require('dotenv').config();
const app = require('express')();
const nodemailer = require('nodemailer');
app.use(require('express').json());

app.listen(process.env.PORT, () => {
    console.log(`Email Service is running on port ${process.env.PORT}`);
});

app.post("/api/email/send", (req: Request, res: Response) => {
    const apiKeyHeader = req.headers["api-key"];
    if (!apiKeyHeader) {
        res.status(400).send("Bad Request: API Key header missing");
        return;
    }
    if (!process.env.API_KEY?.split(',').map(key => key.trim()).filter(Boolean).includes(apiKeyHeader.toString())) {
        res.status(403).send("Forbidden: Invalid API Key");
        return;
    }
    if (!req.body || !req.body.subject || !req.body.text || req.body.website) {
        res.status(400).send("Bad Request: Missing request body");
        return;
    }
    sendMail(req.body.subject, req.body.text, () => {
        res.status(200).send("Email sent successfully");
    }, (error: Error) => {
        res.status(500).send(`Internal Server Error: Failed to send email - ${error.message}`);
    });
}); 

const sendMail = (subject: string, text: string, callback: () => void, errorCallback: (error: Error) => void) => {
    nodemailer.createTransport({host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    }).sendMail({from: process.env.SMTP_USER, to: process.env.SMTP_USER, subject, text}).then(() => {
        callback();
    }).catch((error: Error) => {
        errorCallback(error);
    });
}