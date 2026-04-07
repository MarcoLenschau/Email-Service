import type { Request, Response } from "express";
import type { EmailRequest } from "../types/email-request.type";

const rateLimit = require("express-rate-limit");
const nodemailer = require('nodemailer');
const { ipKeyGenerator } = require("express-rate-limit");

export type JwtPayload = {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
};

/**
 * Creates and returns a rate limiter middleware for controlling the number of requests
 * allowed per API key or IP address within a 24-hour window.
 * The rate limiter allows up to 100 requests per day for requests with a valid admin API key,
 * and up to 25 requests per day for all other requests, identified by their API key or IP address.
 *
 * @author Marco Lenschau <contact@marcolenschau.com>
 * 
 * @return A rate limiter middleware configured with the specified rules.
 */
const getRateLimit = () => {
    return rateLimit({windowMs: 24 * 60 * 60 * 1000,
        max: async (req: Request) => {
            const verifyResponse = await verifyToken(String(req.headers["token"]));
            const verify: JwtPayload = await verifyResponse.json();
            return getRateLimitForKey(verify);
        },
        keyGenerator: (req: Request) => String(req.headers["token"] || ipKeyGenerator(req)),
        message: "Too many requests, please try again later."
    });
};

/**
 * Retrieves the rate limit associated with a given API key.
 *
 * @author Marco Lenschau <contact@marcolenschau.com>
 * @param token - The API token extracted from the request header, which contains the role information of the user (e.g., express, premium, basic).
 * @return The rate limit as a number. Returns the rate limit defined in the environment variables based on the API key type (express, premium, basic).
 */
const getRateLimitForKey = (token: JwtPayload): number => token.role === "EXPRESS" || token.role === "ADMIN" ? Number(process.env.EXPRESS_RATE_LIMIT) :
    token.role === "PREMIUM" ? Number(process.env.PREMIUM_RATE_LIMIT) : Number(process.env.BASIC_RATE_LIMIT);

/**
 * Verifies the provided token by sending a POST request to the authentication service.
 *
 * @author Marco Lenschau <contact@marcolenschau.com>
 * @param token - The token to be verified.
 * @return A Promise that resolves with the response from the authentication service.
 */
const verifyToken = async (token: string) => await fetch(`${process.env.AUTH_SERVICE_URL}/api/verify`, {method: "POST", headers: {"token": token}});

/**
 * Sends an email using the specified subject and text content.
 * 
 * @author Marco Lenschau <contact@marcolenschau.com>
 * @param to - The recipient's email address.
 * @param subject - The subject line of the email.
 * @param text - The plain text content of the email.
 * @param callback - A function to be called upon successful email sending.
 * @param errorCallback - A function to be called if an error occurs during email sending.
 * @return void
 */
const sendMail = ({to, subject, text}: EmailRequest, callback: () => Response, errorCallback: (error: Error) => Response) => {
    nodemailer.createTransport({host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, secure: true,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}
    }).sendMail({from: process.env.SMTP_USER, to: to, subject, text}).then(() => callback())
      .catch((error: Error) => errorCallback(error));
};

module.exports = {getRateLimit, sendMail, verifyToken};