import { useState, useEffect, useCallback } from "react";
import { BookingService } from "../services/bookingService";
import { fmt, formatDate, padId } from "../utils/helpers";
import Navbar from "../components/Navbar";
import Receipt from "../components/Receipt";
import { Badge, MetricCard, EmptyState, Spinner, FeedbackDialog } from "../components/UI";

const TABS = [
  { id: "overview", label: "📊 Overview"       },
  { id: "rooms",    label: "🛏️ Room Bookings"  },
  { id: "tables",   label: "🍽️ Table Bookings" },
  { id: "floors",   label: "🏢 Floor Map"       },
];

const TOTAL_ROOMS_PER_FLOOR  = 4;
const TOTAL_TABLES_PER_FLOOR = 6;

export default function ManagementDashboard() {
  const [tab,    setTab]    = useState("overview");
  const [rooms,  setRooms]  = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [receiptType, setReceiptType] = useState(null);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState({ open: false, tone: "success", title: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [r, t] = await Promise.all([BookingService.getAllRoomBookings(), BookingService.getAllTableBookings()]);
      setRooms(r);
      setTables(t);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Unable to load booking data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (type, id, status) => {
    setError("");
    try {
      const updated = await BookingService.updateBookingStatus(type, id, status);
      await load();
      if (status === "accepted") {
        setReceipt(updated);
        setReceiptType(type);
      } else {
        setDialog({
          open: true,
          tone: "success",
          title: "Booking status updated",
          message: `The ${type} booking has been marked as ${status}.`,
        });
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Unable to update booking status.");
      setDialog({
        open: true,
        tone: "error",
        title: "Status update failed",
        message: e.response?.data?.error || e.message || "Please try the action again.",
      });
    }
  };

  const pendingRooms  = rooms.filter(b => b.status === "pending").length;
  const pendingTables = tables.filter(b => b.status === "pending").length;
  const revenue = [...rooms, ...tables].filter(b => b.status === "accepted").reduce((s, b) => s + b.price, 0);

  const floorData = [1,2,3,4,5].map(floor => ({
    floor,
    roomsBooked:  rooms.filter(b  => b.floor === floor && b.status === "accepted").length,
    tablesBooked: tables.filter(b => b.floor === floor && b.status === "accepted").length,
  }));

  const recent = [...rooms.map(b => ({ ...b, kind: "Room" })), ...tables.map(b => ({ ...b, kind: "Table" }))]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  // ── Action buttons ──────────────────────────────────────────
  const Actions = ({ type, booking }) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {booking.status === "pending" && (<>
        <button className="btn btn-success" style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={() => updateStatus(type, booking.id, "accepted")}>✓ Accept</button>
        <button className="btn btn-danger" style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={() => updateStatus(type, booking.id, "cancelled")}>✗ Cancel</button>
      </>)}
      {booking.status === "accepted" && (
        <button className="btn btn-danger" style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={() => updateStatus(type, booking.id, "cancelled")}>Cancel Booking</button>
      )}
      {booking.status === "cancelled" && (
        <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={() => updateStatus(type, booking.id, "pending")}>Restore to Pending</button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <FeedbackDialog
        open={dialog.open}
        tone={dialog.tone}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog((current) => ({ ...current, open: false }))}
      />
      {receipt && <Receipt booking={receipt} type={receiptType} onClose={() => setReceipt(null)} />}
      {error && (
        <div className="page-container" style={{ paddingBottom: 0 }}>
          <div className="auth-note error">{error}</div>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", display: "flex", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "14px 20px", border: "none",
            borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
            background: "transparent", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif",
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="page-container">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (<>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              <MetricCard label="Pending Rooms"   value={pendingRooms}  accent={pendingRooms  ? "var(--warning)" : undefined} />
              <MetricCard label="Pending Tables"  value={pendingTables} accent={pendingTables ? "var(--warning)" : undefined} />
              <MetricCard label="Total Rooms"     value={rooms.length} />
              <MetricCard label="Total Tables"    value={tables.length} />
              <MetricCard label="Total Revenue"   value={fmt(revenue)} accent="var(--success)" />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Recent Bookings</h3>
              {recent.length === 0 && <EmptyState message="No bookings yet." />}
              {recent.map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{b.name}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{b.kind} · {padId(b.id, b.kind === "Room" ? "R" : "T")}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{fmt(b.price)}</span>
                    <Badge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {/* ── ROOM BOOKINGS ── */}
          {tab === "rooms" && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Room Bookings</h3>
              {rooms.length === 0 && <EmptyState icon="🛏️" message="No room bookings yet." />}
              {rooms.map(b => (
                <div key={b.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{b.name}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{padId(b.id, "R")} · {formatDate(b.createdAt)}</span>
                    </div>
                    <Badge status={b.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6, fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                    <span>📞 {b.contact}</span>
                    <span>🎂 Age {b.age}</span>
                    <span>🛏️ {b.roomType} / {b.bedSize}</span>
                    <span>🏢 Floor {b.floor}</span>
                    <span>🆔 {b.idProof}</span>
                    {b.balcony && <span>🏔️ Balcony</span>}
                    {b.pool    && <span>🏊 Pool</span>}
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>{fmt(b.price)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>📍 {b.address}</div>
                  <Actions type="room" booking={b} />
                </div>
              ))}
            </div>
          )}

          {/* ── TABLE BOOKINGS ── */}
          {tab === "tables" && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Table Bookings</h3>
              {tables.length === 0 && <EmptyState icon="🍽️" message="No table bookings yet." />}
              {tables.map(b => (
                <div key={b.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "1rem", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{b.name}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{padId(b.id, "T")} · {formatDate(b.createdAt)}</span>
                    </div>
                    <Badge status={b.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6, fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                    <span>📞 {b.contact}</span>
                    <span>🎂 Age {b.age}</span>
                    <span>🏢 Floor {b.floor}</span>
                    <span>👥 {b.seats} seats</span>
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>{fmt(b.price)}</span>
                  </div>
                  <Actions type="table" booking={b} />
                </div>
              ))}
            </div>
          )}

          {/* ── FLOOR MAP ── */}
          {tab === "floors" && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Floor Occupancy Map</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {floorData.map(({ floor, roomsBooked, tablesBooked }) => {
                  const roomsFree  = Math.max(0, TOTAL_ROOMS_PER_FLOOR  - roomsBooked);
                  const tablesFree = Math.max(0, TOTAL_TABLES_PER_FLOOR - tablesBooked);
                  return (
                    <div key={floor} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 16 }}>Floor {floor}</h4>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 12, background: "#e8f5e9", color: "#1b5e20", padding: "3px 10px", borderRadius: 20 }}>
                            {roomsFree} room{roomsFree !== 1 ? "s" : ""} free
                          </span>
                          <span style={{ fontSize: 12, background: "#e0f2f1", color: "#004d40", padding: "3px 10px", borderRadius: 20 }}>
                            {tablesFree} table{tablesFree !== 1 ? "s" : ""} free
                          </span>
                        </div>
                      </div>
                      {/* Rooms */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                          Rooms — {roomsBooked}/{TOTAL_ROOMS_PER_FLOOR} booked
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {Array.from({ length: TOTAL_ROOMS_PER_FLOOR }).map((_, i) => (
                            <div key={i} style={{
                              flex: 1, height: 40, borderRadius: 8,
                              background: i < roomsBooked ? "var(--accent)" : "#f3f4f6",
                              border: "1px solid var(--border)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, color: i < roomsBooked ? "#fff" : "var(--text-muted)",
                            }}>
                              {i < roomsBooked ? "🛏️" : "—"}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Tables */}
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                          Tables — {tablesBooked}/{TOTAL_TABLES_PER_FLOOR} booked
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {Array.from({ length: TOTAL_TABLES_PER_FLOOR }).map((_, i) => (
                            <div key={i} style={{
                              flex: 1, height: 40, borderRadius: 8,
                              background: i < tablesBooked ? "#0d9488" : "#f3f4f6",
                              border: "1px solid var(--border)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, color: i < tablesBooked ? "#fff" : "var(--text-muted)",
                            }}>
                              {i < tablesBooked ? "🍽️" : "—"}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
