import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ScribbleCanvasProps {
  fileId: string;
  fileName: string;
  fileType: string;
  scribbleStyle: string;
  intensity: number;
  onBack: () => void;
}

export function ScribbleCanvas({ 
  fileId, 
  fileName, 
  fileType, 
  scribbleStyle, 
  intensity, 
  onBack 
}: ScribbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");

  const generateCaption = useAction(api.ai.generateToddlerCaption);
  const generateScribbles = useAction(api.ai.generateScribblePaths);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: 'white',
    });

    setCanvas(fabricCanvas);

    // Load the uploaded document
    loadDocument(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [fileId]);

  const loadDocument = async (fabricCanvas: fabric.Canvas) => {
    try {
      // Get the document URL from Convex storage
      const response = await fetch(`/api/storage/${fileId}`);
      if (!response.ok) {
        // Fallback: create a placeholder
        const rect = new fabric.Rect({
          left: 50,
          top: 50,
          width: 700,
          height: 500,
          fill: 'white',
          stroke: '#ddd',
          strokeWidth: 2,
        });
        
        const text = new fabric.Text('Your Document Here\n(Preview not available)', {
          left: 400,
          top: 300,
          fontSize: 24,
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          fill: '#999',
        });

        fabricCanvas.add(rect, text);
        fabricCanvas.renderAll();
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);

      if (fileType === 'application/pdf') {
        // For PDF, show a placeholder (would need PDF.js for full rendering)
        const rect = new fabric.Rect({
          left: 50,
          top: 50,
          width: 700,
          height: 500,
          fill: 'white',
          stroke: '#ddd',
          strokeWidth: 2,
        });
        
        const text = new fabric.Text(`PDF: ${fileName}`, {
          left: 400,
          top: 300,
          fontSize: 20,
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          fill: '#333',
        });

        fabricCanvas.add(rect, text);
      } else {
        // For images, load directly
        fabric.FabricImage.fromURL(url).then((img) => {
          img.scaleToWidth(700);
          if (img.height! > 500) {
            img.scaleToHeight(500);
          }
          img.set({
            left: 50,
            top: 50,
            selectable: false,
          });
          fabricCanvas.add(img);
          fabricCanvas.sendObjectToBack(img);
          fabricCanvas.renderAll();
        });
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    }
  };

  const addScribbles = async () => {
    if (!canvas) return;

    setIsGenerating(true);
    try {
      // Generate AI scribbles
      const scribbles = await generateScribbles({
        style: scribbleStyle,
        intensity,
        canvasWidth: 800,
        canvasHeight: 600,
      });

      // Add scribbles to canvas
      scribbles.forEach((scribble: any, index: number) => {
        setTimeout(() => {
          const path = new fabric.Path(scribble.path, {
            fill: '',
            stroke: scribble.color || getRandomColor(scribbleStyle),
            strokeWidth: getStrokeWidth(scribbleStyle),
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            selectable: true,
          });
          
          canvas.add(path);
          canvas.renderAll();
        }, index * 200); // Stagger the appearance
      });

      // Generate a toddler caption
      const generatedCaption = await generateCaption({
        fileName,
        scribbleStyle,
      });
      setCaption(generatedCaption);

      toast.success("Scribbles added! Your document is now properly ruined! 🎨");
    } catch (error) {
      console.error('Error generating scribbles:', error);
      toast.error('Failed to generate scribbles');
    } finally {
      setIsGenerating(false);
    }
  };

  const getRandomColor = (style: string): string => {
    const colors = {
      crayon: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
      marker: ['#FF1744', '#00E676', '#2196F3', '#FF9800', '#9C27B0', '#FFEB3B'],
      pencil: ['#666666', '#888888', '#555555', '#777777'],
      finger_paint: ['#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3'],
    };
    
    const styleColors = colors[style as keyof typeof colors] || colors.crayon;
    return styleColors[Math.floor(Math.random() * styleColors.length)];
  };

  const getStrokeWidth = (style: string): number => {
    const widths = {
      crayon: 8,
      marker: 6,
      pencil: 2,
      finger_paint: 12,
    };
    
    return widths[style as keyof typeof widths] || 6;
  };

  const downloadImage = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement('a');
    link.download = `ruined_${fileName.replace(/\.[^/.]+$/, '')}.png`;
    link.href = dataURL;
    link.click();

    toast.success("Your masterpiece has been downloaded! 🎉");
  };

  const clearScribbles = () => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    objects.forEach((obj: fabric.Object) => {
      if (obj.type === 'path') {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
    setCaption("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold"
        >
          ← Back to Upload
        </button>
        <h3 className="text-xl font-bold text-purple-700">
          Ruining: {fileName}
        </h3>
      </div>

      {/* Canvas */}
      <div className="bg-white p-4 rounded-lg border-4 border-orange-200 shadow-lg">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded max-w-full"
        />
      </div>

      {/* Caption */}
      {caption && (
        <div className="bg-yellow-100 border-4 border-yellow-300 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-lg font-bold text-purple-700 italic">"{caption}"</p>
          <p className="text-sm text-gray-600 mt-1">- Your Little Artist</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={addScribbles}
          disabled={isGenerating}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Adding Chaos...
            </div>
          ) : (
            `🖍️ Add ${scribbleStyle} Scribbles`
          )}
        </button>

        <button
          onClick={clearScribbles}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          🧹 Clear Scribbles
        </button>

        <button
          onClick={downloadImage}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          💾 Download Masterpiece
        </button>
      </div>

      {/* Style Info */}
      <div className="text-center text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
        <p>
          <strong>Style:</strong> {scribbleStyle} | 
          <strong> Intensity:</strong> {intensity}/10 | 
          <strong> Canvas:</strong> 800x600px
        </p>
      </div>
    </div>
  );
}
