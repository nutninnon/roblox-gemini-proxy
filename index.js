const express = require('express');
const app = express();
app.use(express.json());

app.post('/ask-gemini', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.log("ERROR: GEMINI_API_KEY is missing!");
            return res.status(500).json({ error: "API Key not found on server." });
        }
        
        // เปลี่ยนมาใช้ gemini-1.5-pro ครับ
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            res.json({ reply: reply });
        } else {
            console.log("GEMINI API ERROR RESPONSE:", JSON.stringify(data));
            res.status(500).json({ error: "Gemini API Error", details: data });
        }
    } catch (error) {
        console.log("SERVER CATCH ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
