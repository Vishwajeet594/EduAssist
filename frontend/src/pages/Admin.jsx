import { useEffect, useState } from "react";
import API from "../services/api";

function Admin() {

  const [docs, setDocs] =
    useState([]);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {

    const res =
      await API.get("/docs/all");

    setDocs(res.data);
  };

  const deleteDoc =
    async (id) => {

      await API.delete(
        `/docs/${id}`
      );

      loadDocs();
    };

  return (
    <div>

      <h1>
        Uploaded PDFs
      </h1>

      {docs.map((doc) => (

        <div key={doc._id}>

          {doc.title}

          <button
            onClick={() =>
              deleteDoc(doc._id)
            }
          >
            Delete
          </button>

        </div>

      ))}

    </div>
  );
}

export default Admin;