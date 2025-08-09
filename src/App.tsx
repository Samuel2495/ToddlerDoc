import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { DocumentUploader } from "./components/DocumentUploader";
import { DocumentGallery } from "./components/DocumentGallery";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b-4 border-orange-300 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🖍️</div>
            <div>
              <h1 className="text-2xl font-bold text-purple-600">ToddlerDoc™</h1>
              <p className="text-sm text-gray-600">Professional document ruiner</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Content />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-purple-700 mb-4">
          Let's Ruin Some Documents! 🎨
        </h2>
        <Authenticated>
          <p className="text-xl text-gray-700">
            Welcome back, {loggedInUser?.email?.split('@')[0] || "friend"}! 
            Ready to add some toddler magic?
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-gray-700">
            Sign in to start creating beautifully ruined documents
          </p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="bg-white rounded-2xl shadow-xl border-4 border-orange-200 overflow-hidden">
          <div className="flex border-b-2 border-orange-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition-colors ${
                activeTab === 'upload'
                  ? 'bg-orange-300 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
              }`}
            >
              🎨 Create New Masterpiece
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-orange-300 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
              }`}
            >
              🖼️ My Gallery
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'upload' ? <DocumentUploader /> : <DocumentGallery />}
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
