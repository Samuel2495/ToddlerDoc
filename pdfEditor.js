const { PDFDocument } = require('pdf-lib');

// Function to edit PDF with scribbles
async function editPdfWithScribbles(pdfBuffer, scribbles) {
    // Load the existing PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Get all the pages of the PDF
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Overlay scribbles on the page
        const scribbleImage = scribbles[i]; // Assume scribbles are provided as images
        const pngImage = await pdfDoc.embedPng(scribbleImage);
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width,
            height,
        });
    }

    // Save the modified PDF and return the bytes
    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;
}

// Export the function for use in other modules
module.exports = { editPdfWithScribbles };