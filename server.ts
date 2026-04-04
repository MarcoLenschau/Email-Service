import type { Request, Response } from 'express';

const app = require('express')();
const nodemailer = require('nodemailer');
const fs = require('fs');

if (fs.existsSync('.env')) require('dotenv').config();

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

/**
 * Sends an email using the specified subject and text content.
 * 
 * @author Marco Lenschau <contact@marcolenschau.com>
 * @param subject - The subject line of the email.
 * @param text - The plain text content of the email.
 * @param callback - A function to be called upon successful email sending.
 * @param errorCallback - A function to be called if an error occurs during email sending.
 * @return void
 * 
 */
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