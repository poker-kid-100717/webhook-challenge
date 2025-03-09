import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { Request, Response } from "express"; // Ensure correct import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let secretMessage: string | null = null;
let payloadReceivedAt: number | null = null;

// route to receive webhook payload only once
app.post("/webhook", (req: Request, res: Response): any => {
    // attmpet to assign value to our secret if it does not exist
    try {
        if (secretMessage) {
            return res.status(400).json({ message: "Payload already received." });
        }

        secretMessage = req.body.secretMessage;
        payloadReceivedAt = Date.now();

        res.status(200).json({ message: "Payload received successfully" });
    // log error and throw approriate response code
    } catch (error) {
        console.error("Error handling payload:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// route to get secret message and submit repository
app.post("/submit", (req: Request, res: Response): any => {
    // check 
    try {
        if (!secretMessage) {
            return res.status(400).json({ message: "No secret message stored." });
        }

        const { secretCode, repoUrl } = req.body;
        // guard with null checks on secret code and repo-url : values cannot be null 
        if (!secretCode || !repoUrl) {
            return res.status(400).json({ message: "Secret code and repository URL are required." });
        }

        // convert timeLapsw to seconds 
        const timeLapsed = payloadReceivedAt ? (Date.now() - payloadReceivedAt) / 1000 : null;
        // important info i want to see in console.
        console.log("Submission received:", { secretCode, repoUrl, timeTaken: timeLapsed });

        res.status(200).json({
            message: "Submission successful",
            timeTaken: `${timeLapsed} seconds`
        });
        // catch and log error and throw appropriate errpr log to effectivley debug
    } catch (error) {
        console.error("Error handling submission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/secret", (req: express.Request, res: express.Response): any => {
    if (!secretMessage) {
        return res.status(404).json({ message: "No secret message stored yet." });
    }
    res.status(200).json({ secretMessage });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
