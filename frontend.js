async function renderPdfForScribbling(pdfUrl) {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const canvasContainer = document.getElementById('canvas-container');

    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvasContainer.appendChild(canvas);

        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;

        // Add scribbling functionality to the canvas
        enableScribbling(canvas);
    }
}

function enableScribbling(canvas) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    canvas.addEventListener('mousedown', () => (isDrawing = true));
    canvas.addEventListener('mouseup', () => (isDrawing = false));
    canvas.addEventListener('mousemove', (event) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, 2, 2); // Draw a small rectangle to simulate drawing
    });
}

async function saveScribbles() {
    const canvases = document.querySelectorAll('#canvas-container canvas');
    const scribbles = Array.from(canvases).map((canvas) => canvas.toDataURL('image/png'));

    const response = await fetch('/upload', {
        method: 'POST',
        body: JSON.stringify({ scribbles }),
        headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    if (result.path) {
        alert('PDF edited successfully!');
        window.location.href = result.path;
    } else {
        alert('Failed to edit PDF.');
    }
}