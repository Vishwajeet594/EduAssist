import { useEffect, useState } from "react";
import API from "../services/api";
import UploadPdf from "../components/UploadPdf";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

function Admin() {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState({
    stats: { totalUsers: 0, totalChats: 0, totalDocs: 0 },
    recentChats: [],
    recentDocs: []
  });
  const [docs, setDocs] = useState([]);
  const [uploadingHint, setUploadingHint] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, docsRes] = await Promise.all([
        API.get("/admin/overview"),
        API.get("/docs/all")
      ]);

      setOverview(overviewRes.data);
      setDocs(docsRes.data);
    } catch (error) {
      console.error("Admin loadData failed:", error);
      setOverview((prev) => prev);
      setDocs((prev) => prev);
    }
  };

  const deleteDoc = async (id) => {
    setDeletingId(id);
    setDocs((prev) => prev.filter((doc) => (doc.deleteKey || doc.documentId || doc.title) !== id));
    setDeletingId("");
  };

  const stats = overview.stats || {};
  const apiRoot = API.defaults.baseURL.replace("/api", "");

  return (
    <div className="dashboard-shell admin-shell">
      <aside className="dashboard-hero admin-hero">
        <div className="brand-mark">EduAssist Admin</div>
        <div className="hero-copy">
          <span className="hero-pill">Admin workspace</span>
          <h1>Manage the knowledge behind every answer.</h1>
          <p>
            Hi {user?.name || "Admin"}.
            Monitor student activity, uploaded documents, and the overall campus knowledge base.
          </p>
        </div>

        <div className="hero-highlights stats-grid">
          <div className="stat-card">
            <span>Total Users</span>
            <strong>{stats.totalUsers}</strong>
          </div>
          <div className="stat-card">
            <span>Total Chats</span>
            <strong>{stats.totalChats}</strong>
          </div>
          <div className="stat-card">
            <span>Total Docs</span>
            <strong>{stats.totalDocs}</strong>
          </div>
        </div>

        <div className="hero-actions">
          <button className="ghost-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Knowledge base</span>
              <h2>Add a new PDF</h2>
            </div>
            <div className="section-head-actions">
              <p className="section-note">
                Upload new notices or circulars so they become searchable for students right away.
              </p>
              <button type="button" className="secondary-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Upload PDF
              </button>
            </div>
          </div>
          <UploadPdf
            onUploaded={async () => {
              setUploadingHint("Refreshing documents...");
              await loadData();
              setUploadingHint("");
            }}
            onBusyChange={(busy) => {
              setUploadingHint(busy ? "Uploading PDF..." : "");
            }}
          />
          {uploadingHint ? <div className="empty-state" style={{ marginTop: 12 }}>{uploadingHint}</div> : null}
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Documents</span>
              <h2>Uploaded PDFs and delete actions</h2>
            </div>
            <p className="section-note">
              These documents power Pinecone search and answer generation. Admins can remove outdated PDFs here.
            </p>
          </div>

          <div className="data-grid scroll-panel">
            {docs.length ? (
              docs.map((doc) => (
                <div className="data-row" key={doc.deleteKey || doc.documentId || doc.title}>
                  <div>
                    <h3>{doc.title}</h3>
                    <p>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                    <p>
                      {doc.chunkCount
                        ? `${doc.chunkCount} chunks indexed`
                        : "Stored for admin view/delete"}
                    </p>
                  </div>
                  <div className="row-actions">
                    <span className="action-badge">Manage</span>
                    <a
                      className={`secondary-btn link-btn ${!doc.fileUrl ? "is-disabled" : ""}`}
                      href={doc.fileUrl ? `${apiRoot}${doc.fileUrl}` : undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!doc.fileUrl}
                      onClick={(e) => {
                        if (!doc.fileUrl) {
                          e.preventDefault();
                        }
                      }}
                    >
                      See PDF
                    </a>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => deleteDoc(doc.deleteKey || doc.documentId || doc.title)}
                      disabled={deletingId === (doc.deleteKey || doc.documentId || doc.title)}
                    >
                      {deletingId === (doc.deleteKey || doc.documentId || doc.title) ? "Deleting..." : "Delete PDF"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No documents uploaded yet.</div>
            )}
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Recent chats</span>
              <h2>Latest student questions</h2>
            </div>
            <p className="section-note">
              See what students are asking so you can keep documents current.
            </p>
          </div>

          <div className="chat-log-list scroll-panel">
            {overview.recentChats?.length ? (
              overview.recentChats.map((chat) => (
                <div className="chat-log-item" key={chat._id}>
                  <div className="chat-log-meta">
                    <strong>{chat.userId?.name || "Unknown user"}</strong>
                    <span>{chat.userId?.role || "student"}</span>
                  </div>
                  <p><b>Q:</b> {chat.question}</p>
                  <p><b>A:</b> {chat.answer}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">No chat history yet.</div>
            )}
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Recent uploads</span>
              <h2>Latest document additions</h2>
            </div>
          </div>

          <div className="mini-list scroll-panel">
            {overview.recentDocs?.length ? (
              overview.recentDocs.map((doc) => (
                <div className="mini-list-item" key={doc._id}>
                  <strong>{doc.title}</strong>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent uploads.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Admin;
