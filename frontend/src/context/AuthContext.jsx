import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("eduassist_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data) => {
    const session = {
      token: data.token,
      user: {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || "student"
      }
    };

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("eduassist_user", JSON.stringify(session.user));
    setUser(session.user);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("eduassist_user");
    setUser(null);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const stored = sessionStorage.getItem("eduassist_user");

    if (!token || !stored) {
      return;
    }

    setUser(JSON.parse(stored));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
