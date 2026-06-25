import UploadPdf from "../components/UploadPdf";
import ChatBox from "../components/ChatBox";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="sidebar">
        <h2>CampusIQ</h2>

        <p>📄 Upload College PDFs</p>
        <p>💬 Ask Questions</p>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div className="main-content">
        <h1>College Assistant</h1>

        <UploadPdf />

        <ChatBox />
      </div>

    </div>
  );
}

export default Dashboard;