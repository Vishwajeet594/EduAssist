import { useState } from "react";
import API from "../services/api";

function UploadPdf({ onUploaded, onBusyChange }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    try {
      setLoading(true);
      onBusyChange?.(true);
      if (!file) {
        setStatus("Choose a PDF first.");
        return;
      }

      const formData = new FormData();

      formData.append("file", file);

      await API.post(
        "/docs/upload",
        formData
      );

      setStatus("PDF uploaded and indexed successfully.");
      setFile(null);
      onUploaded?.();

    } catch (error) {
      setStatus(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
      onBusyChange?.(false);
    }
  };

  return (
    <div className="upload-section">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button
        type="button"
        className="upload-btn"
        disabled={loading}
        onClick={uploadFile}
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {status && <div className="empty-state" style={{ width: "100%" }}>{status}</div>}

    </div>
  );
}

export default UploadPdf;
