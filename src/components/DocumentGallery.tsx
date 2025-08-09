import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DocumentGallery() {
  const documents = useQuery(api.documents.getUserDocuments);

  if (documents === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-semibold text-purple-700 mb-2">
          No Masterpieces Yet!
        </h3>
        <p className="text-gray-600">
          Upload your first document to start creating toddler art
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-purple-700 text-center">
        Your Ruined Documents Gallery 🖼️
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="bg-white rounded-lg border-4 border-orange-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Preview */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {doc.originalUrl ? (
                doc.fileType.startsWith('image/') ? (
                  <img
                    src={doc.originalUrl}
                    alt={doc.fileName}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm text-gray-600">PDF Document</p>
                  </div>
                )
              ) : (
                <div className="text-gray-400">Loading...</div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h4 className="font-semibold text-purple-700 truncate mb-2">
                {doc.fileName}
              </h4>
              
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Style:</span> {doc.scribbleStyle}
                </p>
                <p>
                  <span className="font-medium">Chaos Level:</span> {doc.intensity}/10
                </p>
                <p>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              {doc.caption && (
                <div className="mt-3 p-2 bg-yellow-100 rounded border-2 border-yellow-300">
                  <p className="text-sm italic text-purple-700">
                    "{doc.caption}"
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {doc.originalUrl && (
                  <a
                    href={doc.originalUrl}
                    download={doc.fileName}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors text-center"
                  >
                    📥 Original
                  </a>
                )}
                {doc.processedUrl && (
                  <a
                    href={doc.processedUrl}
                    download={`ruined_${doc.fileName}`}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors text-center"
                  >
                    🎨 Ruined
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
