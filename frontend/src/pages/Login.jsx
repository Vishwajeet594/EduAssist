import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../css/auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const isAdminLogin = location.pathname === "/admin-login";

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      navigate(res.data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">EduAssist</span>
          <h1>{isAdminLogin ? "Admin portal" : "Welcome back"}</h1>
          <p>
            {isAdminLogin
              ? "Sign in to manage documents, monitor chats, and handle campus content."
              : "Sign in to continue your college assistant, chat history, and admin tools in one place."}
          </p>
          <div className="feature-pills">
            <span>Multilingual chat</span>
            <span>PDF search</span>
            <span>Role-based access</span>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>{isAdminLogin ? "Admin login" : "Login"}</h2>
          <p>{isAdminLogin ? "Use your admin account." : "Use your student or admin account."}</p>

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="auth-footnote">
            {isAdminLogin ? (
              <>
                Student login? <Link to="/">Go back</Link>
              </>
            ) : (
              <>
                New here? <Link to="/register">Create an account</Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
