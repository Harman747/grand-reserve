import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import { BookingService } from "../services/bookingService";
import { TABLE_PRICES, fmt } from "../utils/helpers";
import Navbar from "../components/Navbar";
import Receipt from "../components/Receipt";
import { Field, ToggleBtn, BackBtn, FeedbackDialog } from "../components/UI";

const INIT = { name: "", age: "", contact: "", floor: 1, seats: 4 };

export default function TableBooking() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ ...INIT, name: user?.name || "" });
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy]   = useState(false);
  const [dialog, setDialog] = useState({ open: false, tone: "error", title: "", message: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const price = TABLE_PRICES[form.seats] || 0;
  const valid = form.name && form.age && form.contact;

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const booking = await BookingService.createTableBooking({ ...form, price }, user);
      setReceipt(booking);
    } catch (e) {
      setDialog({
        open: true,
        tone: "error",
        title: "Table booking could not be submitted",
        message: e.message || "Please review the details and try again.",
      });
    }
    finally { setBusy(false); }
  };

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
      {receipt && <Receipt booking={receipt} type="table" onClose={() => navigate("/home")} />}
      <div className="form-container">
        <BackBtn onClick={() => navigate("/home")} label="Back to Home" />
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 20 }}>Table Reservation</h3>

          <Field label="Full Name">
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Enter full name" />
          </Field>
          <div className="grid-2">
            <Field label="Age">
              <input type="number" value={form.age} onChange={e => set("age", e.target.value)} placeholder="Age" />
            </Field>
            <Field label="Contact Number">
              <input value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </Field>
          </div>

          <Field label={`Preferred Floor: Floor ${form.floor}`}>
            <input type="range" min={1} max={5} step={1} value={form.floor}
              onChange={e => set("floor", +e.target.value)} style={{ width: "100%", margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
              {[1,2,3,4,5].map(f => <span key={f}>Floor {f}</span>)}
            </div>
          </Field>

          <Field label="Number of Seats">
            <div className="grid-5" style={{ marginTop: 6 }}>
              {[1, 2, 4, 10, 20].map(s => (
                <ToggleBtn key={s} label={String(s)} sub={s === 1 ? "Solo" : s === 2 ? "Couple" : s === 20 ? "Banquet" : `${s} pax`}
                  active={form.seats === s} onClick={() => set("seats", s)} />
              ))}
            </div>
          </Field>

          <div className="price-bar">
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Cover Charge</span>
            <span className="price">{fmt(price)}</span>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={!valid || busy}>
            {busy ? "Submitting…" : "Confirm Table Booking →"}
          </button>
        </div>
      </div>
    </div>
  );
}
