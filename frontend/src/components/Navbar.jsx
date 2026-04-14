import { useAuth } from "../context/SupabaseAuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      background: user?.role === "MANAGEMENT" ? "#1a1a2e" : "#ffffff",
      borderBottom: "1px solid var(--border)",
      padding: "0.9rem 1.5rem",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🏨</span>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 17, fontWeight: 600,
            color: user?.role === "MANAGEMENT" ? "#fff" : "var(--text)"
          }}>
            Grand Reserve
          </div>
          <div style={{ fontSize: 11, color: user?.role === "MANAGEMENT" ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>
            {user?.role === "MANAGEMENT" ? "Management Panel" : "Hospitality Portal"} · {user?.name}
          </div>
        </div>
      </div>
      <button
        className="btn btn-ghost"
        onClick={logout}
        style={{
          fontSize: 13,
          background: user?.role === "MANAGEMENT" ? "rgba(255,255,255,0.1)" : "transparent",
          color: user?.role === "MANAGEMENT" ? "#fff" : "var(--text)",
          border: "1px solid " + (user?.role === "MANAGEMENT" ? "rgba(255,255,255,0.2)" : "var(--border)"),
        }}>
        Sign Out
      </button>
    </nav>
  );
}
