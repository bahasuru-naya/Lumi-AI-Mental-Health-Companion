const express = require("express");
const Groq = require("groq-sdk");
const https = require("https");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

const groq = new Groq({ apiKey: GROQ_API_KEY });

let lastAIText = "";
let lastShouldDance = false;

//-----------------------------------------------------
// call Deepgram TTS REST API directly
//-----------------------------------------------------
function deepgramTTS(text) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ text });

        const options = {
            hostname: "api.deepgram.com",
            path: "/v1/speak?model=aura-2-thalia-en",
            method: "POST",
            headers: {
                "Authorization": `Token ${DEEPGRAM_API_KEY}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let errBody = "";
                res.on("data", chunk => errBody += chunk);
                res.on("end", () => reject(new Error(`Deepgram error ${res.statusCode}: ${errBody}`)));
                return;
            }
            resolve(res); // res is a Node.js IncomingMessage (readable stream)
        });

        req.on("error", reject);
        req.write(body);
        req.end();
    });
}

//-----------------------------------------------------
// POST /tts
//-----------------------------------------------------
app.post("/tts", async (req, res) => {
    console.log("Incoming body:", req.body);

    const { text } = req.body;
    if (!text) return res.status(400).send("No text provided");

    try {
        // 1. GET AI RESPONSE FROM GROQ
        const aiResponse = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are Lumi, a compassionate and empathetic AI mental health companion. Your goal is to provide a safe, supportive space where users can talk openly about their feelings, including stress, anxiety, or sadness. Offer gentle advice, simple coping strategies, and mindfulness techniques while remaining calm, kind, and non-judgmental. If a user expresses self-harm thoughts or a serious crisis, respond with care and encourage them to seek professional help.when needed clearly mention that you are an AI and not a medical professional. Keep responses as short as possible under 500 characters without losing meaning, always using complete sentences. If a user feels stressed, down, sad, or discouraged, provide comforting and uplifting responses. When appropriate, you MAY cheer them up with a dance. If you choose to do so, first tell them you are going to dance, and then include the exact string “[DANCE]” at the very end of your response. "
                },
                { role: "user", content: text }
            ]
        });

        let aiText = aiResponse.choices[0]?.message?.content || "No output";
        
        let shouldDance = false;
        if (aiText.includes('[DANCE]')) {
            shouldDance = true;
            aiText = aiText.replace(/\[DANCE\]/g, '').trim();
        }        
        

        console.log("AI Output:", aiText);
        lastAIText = aiText;
        lastShouldDance = shouldDance;

        // 2. CONVERT TO SPEECH VIA DEEPGRAM REST API
        const audioStream = await deepgramTTS(aiText);

        // 3. STREAM AUDIO BACK TO CLIENT
        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Disposition": 'inline; filename="speech.mp3"'
        });

        audioStream.pipe(res);

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Server error: " + err.message);
    }
});

//-----------------------------------------------------
// GET /ai-text
//-----------------------------------------------------
app.get("/ai-text", (req, res) => {
    if (!lastAIText) return res.status(404).json({ error: "No AI text available" });

    res.json({ aiText: lastAIText, shouldDance: lastShouldDance });
    lastAIText = "";
    lastShouldDance = false;
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));