const express = require('express');
const app = express();
app.use(express.json());

app.post('/ask-gemini', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: "API Key not found on server." });
        }
        
        // ให้ระบบเช็กลิสต์รุ่นโมเดลที่ใช้งานได้จาก API Key ของคุณนนท์โดยอัตโนมัติ
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();
        
        // ค้นหาโมเดลตัวแรกที่รองรับการสร้างข้อความ (generateContent)
        let activeModel = "models/gemini-1.5-flash"; // ค่าสำรอง
        if (listData.models) {
            const found = listData.models.find(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"));
            if (found) {
                activeModel = found.name; // ชื่อโมเดลที่ถูกต้องตามสิทธิ์คีย์ของคุณนนท์
            }
        }
        
        // ส่งคำขอไปยังโมเดลที่รองรับจริง
        const url = `https://generativelanguage.googleapis.com/v1beta/${activeModel}:generateContent?key=${apiKey}`;
        
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
            res.status(500).json({ error: "Gemini API Error", details: data });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
