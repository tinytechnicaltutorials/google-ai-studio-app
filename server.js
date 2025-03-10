// server.js (Node.js with Express)
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Load environment variables

const app = express();
const port = 3000;

// Multer setup for handling file uploads
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static('public')); //  Make sure the HTML file is in a folder named 'public'

app.post('/identify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const apiKey = process.env.GEMINI_API_KEY;  // Retrieve API key from environment variables
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not found in environment variables' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = "Describe this image. Be concise. Also provide related items.:";
    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
      { text: prompt },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts: imageParts }],
    });

    const responseText = result.response.text();
    console.log(responseText);
    res.json({ description: responseText });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to identify image' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});