import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";

const initialForm = { email: "", otp: "", identifier: "", password: "" };

function AuthField({ label, children, hint }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "rgba(242, 233, 220, 0.72)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: 11, color: "rgba(242, 233, 220, 0.48)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function AuthPortal() {
  const navigate = useNavigate();
  const { user, loading, sendCustomerOtp, verifyCustomerOtp, loginManagement } = useAuth();

  const [role, setRole] = useState("CUSTOMER");
  const [step, setStep] = useState("request");
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const heading = useMemo(
    () => role === "CUSTOMER" ? "Customer Access" : "Management Console",
    [role]
  );

  useEffect(() => {
    if (loading || !user) return;
    navigate(user.role === "MANAGEMENT" ? "/management" : "/home", { replace: true });
  }, [user, loading, navigate]);

  const set = (key, value) => {
    setError("");
    setNotice("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setStep("request");
    setError("");
    setNotice("");
    setForm(initialForm);
  };

  const handleSendOtp = async () => {
    if (!form.email.includes("@")) {
      setError("Enter a valid email address to receive your one-time code.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const normalizedEmail = await sendCustomerOtp(form.email);
      setForm((prev) => ({ ...prev, email: normalizedEmail }));
      setStep("verify");
      setNotice(`Check ${normalizedEmail}. If Supabase is still using magic links, clicking the email link will now sign you in automatically.`);
    } catch (e) {
      setError(e.message || "Unable to send OTP right now.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp.trim()) {
      setError("Enter the OTP from your email to continue.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await verifyCustomerOtp(form.email, form.otp);
      navigate("/home");
    } catch (e) {
      setError(e.message || "That OTP could not be verified.");
    } finally {
      setBusy(false);
    }
  };

  const handleManagementLogin = async () => {
    if (!form.identifier.trim() || !form.password.trim()) {
      setError("Enter your staff username and password.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await loginManagement(form.identifier, form.password);
      navigate("/management");
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Management login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <div className="eyebrow">Grand Reserve</div>
          <h1>Reservations with a sharper workflow.</h1>
          <p>
            Customers sign in with a one-time email code. Management keeps a separate secure staff portal for
            approvals, floor oversight, and operations.
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <strong>Passwordless Customer Login</strong>
              <span>Email OTP through Supabase Auth for every customer session.</span>
            </div>
            <div className="feature-card">
              <strong>Persistent Booking Data</strong>
              <span>Reservations now target cloud-backed Supabase tables instead of browser storage.</span>
            </div>
            <div className="feature-card">
              <strong>Separate Staff Control</strong>
              <span>Management accounts stay manually controlled through Spring Boot APIs.</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-toggle">
            <button className={role === "CUSTOMER" ? "active" : ""} onClick={() => switchRole("CUSTOMER")}>
              Customer
            </button>
            <button className={role === "MANAGEMENT" ? "active" : ""} onClick={() => switchRole("MANAGEMENT")}>
              Management
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="eyebrow" style={{ color: "var(--text-muted)" }}>{heading}</div>
            <h2 style={{ margin: "6px 0 8px" }}>
              {role === "CUSTOMER" ? (step === "request" ? "Sign in with email OTP" : "Verify your code") : "Staff sign in"}
            </h2>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              {role === "CUSTOMER"
                ? "No password needed. We’ll send a one-time code to your email every time you sign in."
                : "Staff accounts are created manually through the backend admin workflow."}
            </p>
          </div>

          <div className="auth-form">
            {role === "CUSTOMER" && step === "request" && (
              <>
                <AuthField label="Email Address" hint="OTP will be sent here">
                  <input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                  />
                </AuthField>
                <button className="btn btn-primary btn-full" onClick={handleSendOtp} disabled={busy}>
                  {busy ? "Sending code..." : "Send OTP"}
                </button>
              </>
            )}

            {role === "CUSTOMER" && step === "verify" && (
              <>
                <AuthField label="Email Address">
                  <input value={form.email} readOnly />
                </AuthField>
                <AuthField label="One-Time Password" hint="Check your inbox">
                  <input
                    value={form.otp}
                    onChange={(e) => set("otp", e.target.value)}
                    placeholder="Enter the OTP"
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                  />
                </AuthField>
                <button className="btn btn-primary btn-full" onClick={handleVerifyOtp} disabled={busy}>
                  {busy ? "Verifying..." : "Verify and Continue"}
                </button>
                <button className="btn btn-ghost btn-full" onClick={handleSendOtp} disabled={busy}>
                  Resend OTP
                </button>
              </>
            )}

            {role === "MANAGEMENT" && (
              <>
                <AuthField label="Staff Username">
                  <input
                    value={form.identifier}
                    onChange={(e) => set("identifier", e.target.value)}
                    placeholder="staff username"
                  />
                </AuthField>
                <AuthField label="Password">
                  <input
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    type="password"
                    placeholder="Enter your password"
                    onKeyDown={(e) => e.key === "Enter" && handleManagementLogin()}
                  />
                </AuthField>
                <button className="btn btn-primary btn-full" onClick={handleManagementLogin} disabled={busy}>
                  {busy ? "Signing in..." : "Open Management Dashboard"}
                </button>
              </>
            )}

            {notice && <div className="auth-note success">{notice}</div>}
            {error && <div className="auth-note error">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
