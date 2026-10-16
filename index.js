const express = require('express');
const app = express();
app.use(express.json());

app.post('/ask-gemini', async (req, res) => {
    const userPrompt = req.body.prompt;
    const apiKey = process.env.GEMINI_API_KEY; // ดึงมาจาก Environment Variable ของ Render เพื่อความปลอดภัย
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    try {
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
            res.status(500).json({ error: "Invalid response from Gemini", details: data });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
