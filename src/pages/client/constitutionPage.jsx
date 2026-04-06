import { Link } from "react-router-dom";

export default function ConstitutionPage() {
  // Replace with the actual path or backend URL of your constitution PDF
  const pdfUrl = "/files/Constitution.pdf"; 

  return (
    // <div className="max-h-screen flex flex-col bg-blue-700">
    <div className="w-full max-h-screen bg-gradient-to-r from-blue-600 to-purple-700 flex flex-col">
      {/* Header */}
      <header className="p-6  text-white text-center shadow">
        <h1 className="text-3xl font-bold">Constitution</h1>
      </header>

      {/* PDF Viewer */}
      <main className="flex-1 p-2 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow h-screen">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title="Constitution PDF"
            className="w-full h-full rounded-lg"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 bg-blue-700 flex justify-center">
        <Link
          to="/control"
          className="px-6 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Home
        </Link>
      </footer>
    </div>
  );
}
