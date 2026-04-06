import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MeetingMinutesPage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // 🔥 PUT YOUR GOOGLE DRIVE FOLDER ID HERE
  const FOLDER_ID = "1SC4CH4p5DNA5oNFhZae4ChgFln-5CzV_";

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      const token = localStorage.getItem("google_token");

      if (!token) {
        alert("Please login with Google first");
        return;
      }

      const res = await axios.get(
        "https://www.googleapis.com/drive/v3/files",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            q: `'${FOLDER_ID}' in parents and trashed=false`,
            fields: "files(id,name,mimeType,webViewLink)",
            orderBy: "createdTime desc",
          },
        }
      );

      setFiles(res.data.files);

      // Auto select first file
      if (res.data.files.length > 0) {
        setSelectedFile(res.data.files[0]);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading files from Google Drive");
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-blue-600 to-purple-700 flex flex-col">
      
      {/* HEADER */}
      <header className="p-6 text-white text-center shadow">
        <h1 className="text-3xl font-bold">📄 Meeting Minutes</h1>
      </header>

      {/* CONTENT */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL - FILE LIST */}
        <div className="w-1/3 bg-white p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3">Documents</h2>

          {files.length === 0 && (
            <p className="text-gray-500">No files found</p>
          )}

          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className={`p-3 mb-2 rounded-lg cursor-pointer border 
                ${selectedFile?.id === file.id 
                  ? "bg-blue-100 border-blue-400" 
                  : "hover:bg-gray-100"}`}
            >
              <p className="font-medium">{file.name}</p>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div className="flex-1 p-4">
          <div className="w-full h-full bg-white rounded-xl shadow overflow-hidden">
            
            {selectedFile ? (
              <iframe
                src={`https://drive.google.com/file/d/${selectedFile.id}/preview`}
                title="Meeting Minutes Viewer"
                className="w-full h-full"
                allow="autoplay"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a document to view
              </div>
            )}

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="p-4 bg-blue-700 flex justify-center">
        <Link
          to="/control"
          className="px-6 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition"
        >
          Go to Home
        </Link>
      </footer>
    </div>
  );
}