import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onSubmit: (file: File) => void;
  loading?: boolean;
  error?: string | null;
}

function UploadZone({ onSubmit, loading, error }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "text/plain": [] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-400 bg-blue-950/30" : "border-gray-700 hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto w-12 h-12 text-gray-500 mb-4" />
        {isDragActive ? (
          <p className="text-blue-400">Drop the file here…</p>
        ) : (
          <p className="text-gray-400">Drag & drop a PDF or TXT file, or click to browse</p>
        )}
      </div>

      {file && (
        <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-gray-300 truncate">{file.name}</span>
          <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={() => file && onSubmit(file)}
        disabled={!file || loading}
        className="w-full py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
      >
        {loading ? "Processing…" : "Process Claim →"}
      </button>
    </div>
  );
}

export default UploadZone;
