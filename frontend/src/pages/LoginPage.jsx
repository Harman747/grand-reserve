import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";

const glassCard = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: "2rem",
};

const inp = {
  padding: "10px 14px", borderRadius: 8, width: "100%",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff", fontSize: 14, outline: "none",
  fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
};

function GlassField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const [mode,  setMode]  = useState("login");   // "login" | "register"
  const [role,  setRole]  = useState("CUSTOMER");
  const [form,  setForm]  = useState({ identifier: "", password: "", name: "", email: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => { setError(""); setForm(f => ({ ...f, [k]: v })); };

  // ── Login ────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.identifier || !form.password) return setError("Please fill in all fields.");
    setError(""); setBusy(true);
    try {
      const user = await login(form.identifier, form.password, role);
      navigate(user.role === "MANAGEMENT" ? "/management" : "/home");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  // ── Register ─────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.name.trim())                       return setError("Please enter your full name.");
    if (!form.email.includes("@"))               return setError("Please enter a valid email address.");
    if (form.password.length < 6)                return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword)  return setError("Passwords do not match.");
    setError(""); setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate("/home");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const TabBtn = ({ label, val }) => (
    <button onClick={() => { setMode(val); setError(""); setForm({ identifier: "", password: "", name: "", email: "", confirmPassword: "" }); }}
      style={{
        flex: 1, padding: "9px", border: "none", borderRadius: 7,
        background: mode === val ? "rgba(124,58,237,0.75)" : "transparent",
        color: mode === val ? "#fff" : "rgba(255,255,255,0.45)",
        fontWeight: mode === val ? 600 : 400,
        cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", transition: "all 0.2s",
      }}>
      {label}
    </button>
  );

  const RoleBtn = ({ label, val, icon }) => (
    <button onClick={() => setRole(val)} style={{
      padding: "10px", borderRadius: 8,
      border: `1.5px solid ${role === val ? "#a78bfa" : "rgba(255,255,255,0.2)"}`,
      background: role === val ? "rgba(167,139,250,0.18)" : "transparent",
      color: "#fff", fontSize: 13, fontWeight: 500,
      cursor: "pointer", fontFamily: "'Inter', sans-serif",
    }}>
      {icon} {label}
    </button>
  );

  const SubmitBtn = ({ label, onClick }) => (
    <button onClick={onClick} disabled={busy} style={{
      width: "100%", padding: "12px", borderRadius: 8, border: "none",
      background: "#7c3aed", color: "#fff", fontWeight: 600, fontSize: 15,
      cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1,
      fontFamily: "'Inter', sans-serif", marginTop: 4,
    }}>
      {busy ? "Please wait…" : label}
    </button>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏨</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontFamily: "'Playfair Display', serif", margin: 0 }}>
            Grand Reserve
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 8, fontSize: 14 }}>
            Hospitality &amp; Dining Reservations
          </p>
        </div>

        <div style={glassCard}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 22, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 4 }}>
            <TabBtn label="Sign In" val="login" />
            <TabBtn label="Create Account" val="register" />
          </div>

          {/* ── REGISTER ── */}
          {mode === "register" && (
            <>
              <div style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}>
                <p style={{ color: "rgba(200,180,255,0.9)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                  👤 Registration is open to <strong>customers only</strong>. Management staff accounts are set up by the administrator.
                </p>
              </div>
              <GlassField label="Full Name">
                <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" />
              </GlassField>
              <GlassField label="Email Address">
                <input style={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
              </GlassField>
              <GlassField label="Password">
                <input style={inp} type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Minimum 6 characters" />
              </GlassField>
              <GlassField label="Confirm Password">
                <input style={inp} type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                  placeholder="Repeat password" onKeyDown={e => e.key === "Enter" && handleRegister()} />
              </GlassField>
              {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 10 }}>{error}</p>}
              <SubmitBtn label="Create Account →" onClick={handleRegister} />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 14, textAlign: "center" }}>
                Already have an account?{" "}
                <button onClick={() => setMode("login")}
                  style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: "'Inter', sans-serif" }}>
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* ── LOGIN ── */}
          {mode === "login" && (
            <>
              {/* Role selector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                <RoleBtn label="Customer"   val="CUSTOMER"   icon="👤" />
                <RoleBtn label="Management" val="MANAGEMENT" icon="🔧" />
              </div>

              <GlassField label={role === "CUSTOMER" ? "Email Address" : "Username"}>
                <input style={inp} value={form.identifier}
                  onChange={e => set("identifier", e.target.value)}
                  placeholder={role === "CUSTOMER" ? "you@example.com" : "Staff username"} />
              </GlassField>
              <GlassField label="Password">
                <input style={inp} type="password" value={form.password}
                  onChange={e => set("password", e.target.value)}
                  placeholder="Enter your password"
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </GlassField>

              {/* Staff info note */}
              {role === "MANAGEMENT" && (
                <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                  <p style={{ color: "rgba(251,191,36,0.8)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                    ℹ️ Staff accounts are created by the backend administrator. Contact your manager if you need access.
                  </p>
                </div>
              )}

              {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 10 }}>{error}</p>}
              <SubmitBtn label="Sign In →" onClick={handleLogin} />

              {role === "CUSTOMER" && (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 14, textAlign: "center" }}>
                  New here?{" "}
                  <button onClick={() => setMode("register")}
                    style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 12, textDecoration: "underline", fontFamily: "'Inter', sans-serif" }}>
                    Create an account
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
