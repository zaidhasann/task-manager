import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [scrolled, setScrolled] = useState(false);

  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        ...styles.nav,
        boxShadow: scrolled
          ? "0 4px 12px rgba(0,0,0,0.08)"
          : "none"
      }}
    >
      <h2 style={styles.logo}>TaskManager</h2>

      <div style={styles.actions}>
        <button
          onClick={toggleTheme}
          style={styles.iconBtn}
          title="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: "60px",
    padding: "0 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--card)",
    borderBottom: "1px solid var(--muted)",
    transition: "box-shadow 0.25s ease, background-color 0.25s ease"
  },
  logo: {
    fontSize: "20px",
    fontWeight: 600,
    color: "var(--text)"
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  iconBtn: {
    background: "transparent",
    border: "1px solid var(--muted)",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    color: "var(--text)",
    transition: "transform 0.15s ease"
  },
  logoutBtn: {
    background: "var(--danger)",
    border: "none",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "transform 0.15s ease"
  }
};
