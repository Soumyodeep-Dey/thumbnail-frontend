"use client";

import { useState } from "react";
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
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎨 YouTube Thumbnail Generator
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <input
          type="text"
          placeholder="Video Type (e.g. Gaming)"
          value={videoType}
          onChange={(e) => setVideoType(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />

        <input
          type="text"
          placeholder="Style (e.g. Flashy, Minimal)"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />

        <input
          type="text"
          placeholder="Mood (e.g. Exciting, Funny)"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />

        <select
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          {loading ? "Generating..." : "Generate Thumbnails"}
        </button>
      </form>

      {thumbnails.length > 0 && (
        <div className="mt-6 w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Generated Thumbnails
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {thumbnails.map((thumb, i) => (
              <div
                key={i}
                className="border rounded-lg overflow-hidden shadow bg-white"
              >
                <img
                  src={thumb}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-auto"
                />
                <div className="flex justify-between p-2">
                  <a
                    href={thumb}
                    download={`thumbnail_${i + 1}.png`}
                    className="text-blue-600 text-sm"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(thumb)}
                    className="text-green-600 text-sm"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={downloadAll}
            className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 w-full"
          >
            Download All as ZIP
          </button>
        </div>
      )}
    </div>
  );
}
