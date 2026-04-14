import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import { BookingService } from "../services/bookingService";
import { fmt, formatDate, padId } from "../utils/helpers";
import Navbar from "../components/Navbar";
import { Badge, EmptyState, Spinner } from "../components/UI";

function ProfilePrompt({ user, onSave }) {
  const [name, setName] = useState(user.name || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim()) {
      setError("Please add your full name before making reservations.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({ name });
    } catch (e) {
      setError(e.message || "Unable to save your profile just yet.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hero-banner profile-banner">
      <div>
        <div className="eyebrow">Complete Your Profile</div>
        <h3 style={{ margin: "6px 0 8px" }}>Add your guest name once so your future bookings are faster.</h3>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.76)" }}>
          Your OTP login is active. We just need the display name you want on room and table reservations.
        </p>
      </div>
      <div className="profile-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? "Saving..." : "Save Name"}
        </button>
      </div>
      {error && <div className="auth-note error" style={{ marginTop: 14 }}>{error}</div>}
    </div>
  );
}

export default function CustomerHub() {
  const navigate = useNavigate();
  const { user, completeCustomerProfile } = useAuth();
  const [tab, setTab] = useState("home");
  const [rooms, setRooms] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [roomRows, tableRows] = await Promise.all([
        BookingService.getRoomBookingsByUser(user.id),
        BookingService.getTableBookingsByUser(user.id),
      ]);
      setRooms(roomRows);
      setTables(tableRows);
    } catch (e) {
      setLoadError(e.message || "Unable to load your reservation history right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  const allBookings = [
    ...rooms.map((booking) => ({ ...booking, kind: "Room" })),
    ...tables.map((booking) => ({ ...booking, kind: "Table" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div className="tab-strip">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}>Home</button>
        <button className={tab === "bookings" ? "active" : ""} onClick={() => setTab("bookings")}>My Bookings</button>
      </div>

      <div className="page-container">
        {tab === "home" && (
          <>
            <div className="hero-banner">
              <div>
                <div className="eyebrow">Customer Portal</div>
                <h2>Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h2>
                <p>
                  Build your next stay like a concierge request. Your reservations, confirmations, and dining plans now
                  stay synced across devices.
                </p>
              </div>
              <div className="hero-stat-grid">
                <div>
                  <strong>{rooms.length + tables.length}</strong>
                  <span>Total reservations</span>
                </div>
                <div>
                  <strong>{rooms.filter((item) => item.status === "accepted").length + tables.filter((item) => item.status === "accepted").length}</strong>
                  <span>Confirmed bookings</span>
                </div>
              </div>
            </div>

            <div className="experience-band">
              <div className="experience-copy">
                <div className="eyebrow" style={{ color: "var(--accent-strong)" }}>Curated Experience</div>
                <h3>From quiet suites to banquet tables, the space adapts around the occasion.</h3>
                <p>
                  Reserve rooms with tailored amenities, or set the dining floor and seating plan ahead of arrival. The
                  management team confirms every request personally.
                </p>
              </div>
              <div className="experience-grid">
                <div>
                  <strong>{rooms.filter((item) => item.status === "pending").length}</strong>
                  <span>Room requests awaiting review</span>
                </div>
                <div>
                  <strong>{tables.filter((item) => item.status === "pending").length}</strong>
                  <span>Dining requests awaiting review</span>
                </div>
                <div>
                  <strong>{fmt([...rooms, ...tables].filter((item) => item.status === "accepted").reduce((sum, item) => sum + Number(item.price || 0), 0))}</strong>
                  <span>Confirmed booking value</span>
                </div>
              </div>
            </div>

            {user?.needsProfile && (
              <ProfilePrompt user={user} onSave={completeCustomerProfile} />
            )}

            <div className="home-grid">
              {[
                {
                  path: "/book-room",
                  icon: "Suites",
                  title: "Reserve a Room",
                  desc: "Build your stay with room type, bed choice, floor preference, and extras.",
                  cta: "From ₹1,500 per night",
                },
                {
                  path: "/book-table",
                  icon: "Dining",
                  title: "Reserve a Table",
                  desc: "Book your dining setup across multiple floor and seat configurations.",
                  cta: "From ₹200 cover charge",
                },
              ].map((option) => (
                <button key={option.path} className="panel-card action-card" onClick={() => navigate(option.path)}>
                  <div className="action-icon">{option.icon}</div>
                  <h3>{option.title}</h3>
                  <p>{option.desc}</p>
                  <span>{option.cta}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "bookings" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ color: "var(--text-muted)" }}>Reservation Ledger</div>
              <h3 style={{ marginTop: 6 }}>Your recent bookings</h3>
            </div>

            {loadError && <div className="auth-note error" style={{ marginBottom: 16 }}>{loadError}</div>}

            {loading && <Spinner />}

            {!loading && allBookings.length === 0 && (
              <EmptyState icon="Inbox" message="You have not made any bookings yet. Start with a room or table reservation." />
            )}

            {!loading && allBookings.map((booking) => (
              <div key={`${booking.kind}-${booking.id}`} className="booking-card">
                <div className="booking-head">
                  <div>
                    <div className="booking-title">
                      {booking.kind === "Room" ? "Room Reservation" : "Table Reservation"}
                    </div>
                    <div className="booking-subtitle">{padId(booking.id, booking.kind === "Room" ? "R" : "T")}</div>
                  </div>
                  <Badge status={booking.status} />
                </div>

                <div className="booking-grid">
                  {booking.kind === "Room" ? (
                    <>
                      <span>{booking.roomType} / {booking.bedSize}</span>
                      <span>Floor {booking.floor}</span>
                      <span>{booking.balcony ? "Balcony included" : "No balcony"}</span>
                      <span>{booking.pool ? "Pool access" : "No pool access"}</span>
                    </>
                  ) : (
                    <>
                      <span>{booking.seats} seats</span>
                      <span>Floor {booking.floor}</span>
                    </>
                  )}
                  <span>{formatDate(booking.createdAt)}</span>
                </div>

                <div className="booking-footer">
                  <strong>{fmt(booking.price)}</strong>
                  <span>
                    {booking.status === "pending" && "Pending management approval"}
                    {booking.status === "accepted" && "Confirmed. Bring ID on arrival."}
                    {booking.status === "cancelled" && "This booking has been cancelled"}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
