import { useEffect, useState } from "react";
import API from "../services/api";
import UploadPdf from "../components/UploadPdf";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await API.get("/docs/all");
      setDocs(res.data);
    } catch {
      setDocs([]);
    }
  };

  const highlights = [
    {
      title: "Find answers faster",
      text: "Fee dates, scholarships, timetables, hostel info, and notices."
    },
    {
      title: "Ask in your language",
      text: "English, Hindi, Tamil, Telugu, Bengali, and Marathi supported."
    },
    {
      title: "Powered by RAG",
      text: "Answers come from college PDFs and structured document search."
    }
  ];

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-hero">
        <div className="brand-mark">EduAssist</div>
        <div className="hero-copy">
          <span className="hero-pill">Student workspace</span>
          <h1>Your campus information, instantly.</h1>
          <p>
            Hi {user?.name || "there"}.
            EduAssist helps you quickly search college PDFs and get answers in your preferred language.
          </p>
        </div>

        <div className="hero-highlights">
          {highlights.map((item) => (
            <div className="hero-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="hero-actions">
          {isAdmin && (
            <button className="secondary-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Upload PDF
            </button>
          )}
          <button
            className="ghost-btn"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {isAdmin && (
          <section className="section-card">
            <div className="section-head">
              <div>
                <span className="section-kicker">Knowledge base</span>
                <h2>Upload notices, circulars, and PDFs</h2>
              </div>
              <p className="section-note">
                Add official documents so students can search them with natural language.
              </p>
            </div>
            <UploadPdf />
          </section>
        )}

        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Documents</span>
              <h2>Available PDFs</h2>
            </div>
            <p className="section-note">
              Students can browse uploaded PDFs here. Admins can manage them above.
            </p>
          </div>

          <div className="mini-list scroll-panel">
            {docs.length ? (
              docs.map((doc) => (
                <div className="mini-list-item" key={doc._id || doc.documentId || doc.title}>
                  <strong>{doc.title}</strong>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No PDFs available yet.</div>
            )}
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Assistant</span>
              <h2>Ask anything about campus life</h2>
            </div>
            <p className="section-note">
              Use simple questions like fee deadlines, scholarships, exams, hostels, or timetable details.
            </p>
          </div>
          <ChatBox />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
