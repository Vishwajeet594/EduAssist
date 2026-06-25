import { useState } from "react";
import API from "../services/api";

function UploadPdf() {
  const [file, setFile] = useState(null);

  const uploadFile = async () => {
    try {
      const formData = new FormData();

      formData.append("file", file);

      await API.post(
        "/docs/upload",
        formData
      );

      alert("PDF Uploaded");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="upload-section">

      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <button
        className="upload-btn"
        onClick={uploadFile}
      >
        Upload PDF
      </button>

    </div>
  );
}

export default UploadPdf;