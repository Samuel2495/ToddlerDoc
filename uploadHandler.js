const fs = require('fs');
const { editPdfWithScribbles } = require('./pdfEditor');
const express = require('express');
const app = express();
app.use(express.json({ limit: '10mb' })); // Increase limit if necessary

app.post('/upload', async (req, res) => {
    const uploadedFilePath = req.body.filePath; // Path to the uploaded PDF file
    const scribbles = req.body.scribbles; // Assume scribbles are sent as base64 images
    const pdfBuffer = fs.readFileSync(uploadedFilePath);

    try {
        const modifiedPdf = await editPdfWithScribbles(pdfBuffer, scribbles);
        const outputFilePath = uploadedFilePath.replace('.pdf', '_edited.pdf');
        fs.writeFileSync(outputFilePath, modifiedPdf);

        res.status(200).send({ message: 'PDF edited successfully', path: outputFilePath });
    } catch (error) {
        console.error('Error editing PDF:', error);
        res.status(500).send({ error: 'Failed to edit PDF' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});