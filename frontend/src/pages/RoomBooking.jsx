import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import { BookingService } from "../services/bookingService";
import { ROOM_PRICES, calcRoomPrice, fmt } from "../utils/helpers";
import Navbar from "../components/Navbar";
import Receipt from "../components/Receipt";
import { Field, StepBar, ToggleBtn, BackBtn, FeedbackDialog } from "../components/UI";

const INIT = {
  name: "", age: "", contact: "", address: "", idProof: "",
  roomType: "Double", bedSize: "King", floor: 3, balcony: false, pool: false,
};

export default function RoomBooking() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({ ...INIT, name: user?.name || "" });
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy]   = useState(false);
  const [dialog, setDialog] = useState({ open: false, tone: "error", title: "", message: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const price = calcRoomPrice(form);

  const step1Valid = form.name && form.age && form.contact && form.address && form.idProof;

  const handleSubmit = async () => {
    setBusy(true);
    try {
      const booking = await BookingService.createRoomBooking({ ...form, price }, user);
      setReceipt(booking);
    } catch (e) {
      setDialog({
        open: true,
        tone: "error",
        title: "Room booking could not be submitted",
        message: e.message || "Please review your details and try again in a moment.",
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
      {receipt && (
        <Receipt booking={receipt} type="room" onClose={() => navigate("/home")} />
      )}
      <div className="form-container">
        <BackBtn onClick={() => step === 1 ? navigate("/home") : setStep(1)}
          label={step === 1 ? "Back to Home" : "Previous Step"} />
        <StepBar steps={2} current={step} />

        {step === 1 && (
          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: 20 }}>Guest Details</h3>
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
            <Field label="Address">
              <textarea style={{ height: 80, resize: "none" }} value={form.address}
                onChange={e => set("address", e.target.value)} placeholder="Full address" />
            </Field>
            <Field label="ID Proof (Aadhaar / PAN / Passport — required at check-in)">
              <input value={form.idProof} onChange={e => set("idProof", e.target.value)}
                placeholder="e.g. Aadhaar 1234 5678 9012" />
            </Field>
            <button className="btn btn-primary btn-full" style={{ marginTop: 8 }}
              disabled={!step1Valid} onClick={() => setStep(2)}>
              Next: Room Preferences →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: 20 }}>Room Preferences</h3>

            <Field label="Room Type">
              <div className="grid-4" style={{ marginTop: 6 }}>
                {["Single", "Double", "Triple", "Quad"].map(t => (
                  <ToggleBtn key={t} label={t} sub={fmt(ROOM_PRICES.type[t])}
                    active={form.roomType === t} onClick={() => set("roomType", t)} />
                ))}
              </div>
            </Field>

            <Field label="Bed Size">
              <div className="grid-3" style={{ marginTop: 6 }}>
                {["Twin", "Queen", "King"].map(b => (
                  <ToggleBtn key={b} label={b} sub={`+${fmt(ROOM_PRICES.bed[b])}`}
                    active={form.bedSize === b} onClick={() => set("bedSize", b)} />
                ))}
              </div>
            </Field>

            <Field label={`Floor: Floor ${form.floor} · +${fmt(ROOM_PRICES.floor[form.floor])}`}>
              <input type="range" min={1} max={5} step={1} value={form.floor}
                onChange={e => set("floor", +e.target.value)} style={{ width: "100%", margin: "6px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
                {[1,2,3,4,5].map(f => <span key={f}>F{f}</span>)}
              </div>
            </Field>

            <Field label="Extras">
              <div className="grid-2" style={{ marginTop: 6 }}>
                {[
                  { key: "balcony", icon: "🏔️", label: "Balcony", price: ROOM_PRICES.balcony },
                  { key: "pool",    icon: "🏊", label: "Pool Access", price: ROOM_PRICES.pool },
                ].map(({ key, icon, label, price: p }) => (
                  <ToggleBtn key={key} label={`${icon} ${label}`} sub={`+${fmt(p)}`}
                    active={form[key]} onClick={() => set(key, !form[key])} />
                ))}
              </div>
            </Field>

            <div className="price-bar">
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Estimated Total / Night</span>
              <span className="price">{fmt(price)}</span>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={busy}>
              {busy ? "Submitting…" : "Confirm Booking →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
