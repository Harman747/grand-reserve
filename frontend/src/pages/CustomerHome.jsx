import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import { BookingService } from "../services/bookingService";
import { fmt, formatDate, padId } from "../utils/helpers";
import Navbar from "../components/Navbar";
import { Badge, EmptyState, Spinner } from "../components/UI";

export default function CustomerHome() {
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const [tab, setTab] = useState("home");   // "home" | "bookings"
  const [rooms,  setRooms]  = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    const [r, t] = await Promise.all([
      BookingService.getRoomBookingsByUser(user.id),
      BookingService.getTableBookingsByUser(user.id),
    ]);
    setRooms(r);
    setTables(t);
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "bookings") loadBookings();
  }, [tab]);

  const allBookings = [
    ...rooms.map(b  => ({ ...b, kind: "Room"  })),
    ...tables.map(b => ({ ...b, kind: "Table" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tabStyle = (active) => ({
    padding: "12px 20px", border: "none",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    background: "transparent", cursor: "pointer", fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? "var(--accent)" : "var(--text-muted)",
    fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", display: "flex" }}>
        <button style={tabStyle(tab === "home")}     onClick={() => setTab("home")}>🏠 Home</button>
        <button style={tabStyle(tab === "bookings")} onClick={() => setTab("bookings")}>📋 My Bookings</button>
      </div>

      {/* ── HOME ── */}
      {tab === "home" && (
        <div style={{ maxWidth: 700, margin: "3rem auto", padding: "0 1rem", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>Welcome back, {user.name.split(" ")[0]}!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>What would you like to book today?</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              {
                path: "/book-room", icon: "🛏️", title: "Book a Room",
                desc: "Single, Double, Triple or Quad rooms with custom bed, floor, balcony & pool options.",
                cta: "Starting ₹1,500 / night", color: "#7c3aed",
              },
              {
                path: "/book-table", icon: "🍽️", title: "Book a Table",
                desc: "Reserve your dining table for 1, 2, 4, 10 or 20 guests on your preferred floor.",
                cta: "Tables for 1 – 20 guests", color: "#0d9488",
              },
            ].map(o => (
              <button key={o.path} onClick={() => navigate(o.path)}
                style={{
                  background: "#fff", border: "1px solid var(--border)", borderRadius: 16,
                  padding: "2rem 1.5rem", cursor: "pointer", textAlign: "center",
                  transition: "box-shadow 0.2s, transform 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>{o.icon}</div>
                <h3 style={{ fontSize: 18, marginBottom: 10 }}>{o.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>{o.desc}</p>
                <div style={{ background: o.color, color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500 }}>
                  {o.cta} →
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MY BOOKINGS ── */}
      {tab === "bookings" && (
        <div style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1rem" }}>
          <h3 style={{ marginBottom: 20, fontSize: 22 }}>My Bookings</h3>

          {loading && <Spinner />}

          {!loading && allBookings.length === 0 && (
            <EmptyState icon="📭" message="You haven't made any bookings yet. Go to Home to get started!" />
          )}

          {!loading && allBookings.map((b, i) => (
            <div key={`${b.kind}-${b.id}`} style={{
              background: "#fff", border: "1px solid var(--border)",
              borderRadius: 12, padding: "1.25rem", marginBottom: 12,
              borderLeft: `4px solid ${b.status === "accepted" ? "#198754" : b.status === "cancelled" ? "#dc3545" : "#b45309"}`,
            }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    {b.kind === "Room" ? "🛏️ Room Booking" : "🍽️ Table Booking"}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
                    {padId(b.id, b.kind === "Room" ? "R" : "T")}
                  </span>
                </div>
                <Badge status={b.status} />
              </div>

              {/* Details grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "6px 12px", fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                {b.kind === "Room" ? (<>
                  <span>🛏️ {b.roomType} / {b.bedSize}</span>
                  <span>🏢 Floor {b.floor}</span>
                  {b.balcony && <span>🏔️ Balcony</span>}
                  {b.pool    && <span>🏊 Pool</span>}
                </>) : (<>
                  <span>👥 {b.seats} seat{b.seats > 1 ? "s" : ""}</span>
                  <span>🏢 Floor {b.floor}</span>
                </>)}
                <span>📅 {formatDate(b.createdAt)}</span>
              </div>

              {/* Price + status message */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "var(--accent)", fontSize: 16 }}>{fmt(b.price)}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                  {b.status === "pending"   && "⏳ Awaiting management approval"}
                  {b.status === "accepted"  && "✅ Booking confirmed — please bring ID"}
                  {b.status === "cancelled" && "❌ This booking was cancelled"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
