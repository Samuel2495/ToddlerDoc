import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { ScribbleCanvas } from "./ScribbleCanvas";

export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scribbleStyle, setScribbleStyle] = useState<string>('crayon');
  const [intensity, setIntensity] = useState<number>(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file");
        return;
      }

      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      setUploadedFileId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();
      setUploadedFileId(storageId);

      // Save document record
      await saveDocument({
        originalFileId: storageId,
        fileName: file.name,
        fileType: file.type,
        scribbleStyle,
        intensity,
      });

      toast.success("Document uploaded! Now let's add some scribbles!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadedFileId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedFileId && file) {
    return (
      <ScribbleCanvas
        fileId={uploadedFileId}
        fileName={file.name}
        fileType={file.type}
        scribbleStyle={scribbleStyle}
        intensity={intensity}
        onBack={resetUpload}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="border-4 border-dashed border-orange-300 rounded-xl p-8 text-center bg-orange-50">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-purple-700 mb-2">
          Upload Your Pristine Document
        </h3>
        <p className="text-gray-600 mb-4">
          Choose a PDF, JPG, or PNG file to transform into a toddler masterpiece
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Choose File
        </button>
        
        {file && (
          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-200">
            <p className="font-medium text-purple-700">Selected: {file.name}</p>
            <p className="text-sm text-gray-600">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {/* Scribble Style Selection */}
      {file && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-purple-700 mb-3">
              Choose Your Destruction Style 🎨
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'crayon', label: '🖍️ Crayon', desc: 'Waxy and bold' },
                { value: 'marker', label: '🖊️ Marker', desc: 'Bright and messy' },
                { value: 'pencil', label: '✏️ Pencil', desc: 'Light and sketchy' },
                { value: 'finger_paint', label: '🎨 Finger Paint', desc: 'Smudgy chaos' },
              ].map((style) => (
                <button
                  key={style.value}
                  onClick={() => setScribbleStyle(style.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    scribbleStyle === style.value
                      ? 'border-purple-500 bg-purple-100 text-purple-700'
                      : 'border-gray-300 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="font-semibold">{style.label}</div>
                  <div className="text-xs text-gray-600">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-purple-700 mb-3">
              Chaos Level: {intensity}/10 🌪️
            </h4>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Gentle</span>
              <span>Moderate</span>
              <span>Chaos</span>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Uploading...
              </div>
            ) : (
              "🚀 Let's Ruin This Document!"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
