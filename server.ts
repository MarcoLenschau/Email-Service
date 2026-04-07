import type { Request, Response } from "express";

const { getRateLimit, sendMail, verifyToken } = require("./utils/utils");
const app = require('express')();
const fs = require('fs');

if (fs.existsSync('.env')) require('dotenv').config();

app.use(getRateLimit());
app.use(require('express').json());

app.listen(process.env.PORT, () => console.log(`Email Service is running on port ${process.env.PORT}`));

app.post("/api/email/send", async (req: Request, res: Response) => {
    const apiKeyHeader = req.headers["token"];
    if (!apiKeyHeader) return res.status(400).send("Bad Request: Header token missing");  
    const verify = await verifyToken(apiKeyHeader.toString());
    if (verify.status !== 200) return res.status(403).send("Forbidden: Invalid Token");
    if (!req.body || !req.body.to || !req.body.subject || !req.body.text || req.body.website) {
        return res.status(400).send("Bad Request: Missing request body");
    }
    sendMail(req.body, () => res.status(200).send("Email sent successfully"), 
        (error: Error) => res.status(500).send(`Internal Server Error: Failed to send email - ${error.message}`));
}); 
