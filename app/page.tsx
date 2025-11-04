"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ThumbnailResponse {
  thumbnails: string[]; // URLs or base64 strings
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState("");
  const [style, setStyle] = useState("");
  const [mood, setMood] = useState("");
  const [placement, setPlacement] = useState("center");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Please upload a photo!");

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("videoType", videoType);
    formData.append("style", style);
    formData.append("mood", mood);
    formData.append("placement", placement);

    try {
      setLoading(true);
      const res = await axios.post<ThumbnailResponse>(
        "http://localhost:5000/api/generate-thumbnails",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setThumbnails(res.data.thumbnails);
    } catch (err) {
      console.error(err);
      alert("Error generating thumbnails!");
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    for (let i = 0; i < thumbnails.length; i++) {
      const blob = await fetch(thumbnails[i]).then((r) => r.blob());
      zip.file(`thumbnail_${i + 1}.png`, blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "thumbnails.zip");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
            🎨 YouTube Thumbnail Generator
          </h1>
          <p className="text-gray-600 text-lg animate-fade-in-delay">
            Create stunning thumbnails in seconds with AI
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-effect p-8 rounded-2xl w-full max-w-lg hover-lift animate-slide-up"
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📸 Upload Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border-2 border-gray-200 p-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎬 Video Type
              </label>
              <input
                type="text"
                placeholder="e.g., Gaming, Vlog, Tutorial"
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-xl input-focus outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎨 Style
              </label>
              <input
                type="text"
                placeholder="e.g., Flashy, Minimal, Professional"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-xl input-focus outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                😊 Mood
              </label>
              <input
                type="text"
                placeholder="e.g., Exciting, Funny, Serious"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-xl input-focus outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Image Placement
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-xl input-focus outline-none cursor-pointer bg-white"
              >
                <option value="left">⬅️ Left</option>
                <option value="center">⬆️ Center</option>
                <option value="right">➡️ Right</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Magic...
              </span>
            ) : (
              "✨ Generate Thumbnails"
            )}
          </button>
        </form>

        {/* Results */}
        {thumbnails.length > 0 && (
          <div className="mt-10 w-full max-w-6xl">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🎉 Your Amazing Thumbnails
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thumbnails.map((thumb, i) => (
                <div
                  key={i}
                  className="glass-effect rounded-2xl overflow-hidden hover-lift group"
                >
                  <div className="relative overflow-hidden w-full aspect-video">
                    <Image
                      src={thumb}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex justify-between items-center p-4 gap-2">
                    <a
                      href={thumb}
                      download={`thumbnail_${i + 1}.png`}
                      className="flex-1 text-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors duration-200"
                    >
                      ⬇️ Download
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(thumb);
                        alert("Link copied to clipboard!");
                      }}
                      className="flex-1 text-center bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors duration-200"
                    >
                      📋 Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={downloadAll}
              className="mt-8 w-full max-w-md mx-auto block bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              📦 Download All as ZIP
            </button>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.2s backwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.3s backwards;
        }
      `}</style>
    </div>
  );
}
