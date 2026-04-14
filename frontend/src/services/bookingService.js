import { clientApi } from "./clientApi";
import { supabase } from "./supabase";

function normalizeBooking(row, kind) {
  return {
    ...row,
    kind,
    status: row.status?.toLowerCase?.() || row.status,
    createdAt: row.createdAt || row.created_at,
    customerId: row.customerId || row.customer_id,
    customerEmail: row.customerEmail || row.customer_email,
    customerName: row.customerName || row.customer_name,
    idProof: row.idProof || row.id_proof,
    roomType: row.roomType || row.room_type,
    bedSize: row.bedSize || row.bed_size,
  };
}

export async function ensureCustomerProfile(user) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
      role: "CUSTOMER",
      name: user.user_metadata?.name || "",
    }, { onConflict: "id" })
    .select()
    .single();

  if (insertError) throw insertError;
  return inserted;
}

export async function updateCustomerProfile(userId, payload) {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const BookingService = {
  async createRoomBooking(data, user) {
    const { data: inserted, error } = await supabase
      .from("room_bookings")
      .insert({
        customer_id: user.id,
        customer_email: user.email,
        customer_name: data.name,
        name: data.name,
        age: Number(data.age),
        contact: data.contact,
        address: data.address,
        id_proof: data.idProof,
        room_type: data.roomType,
        bed_size: data.bedSize,
        floor: Number(data.floor),
        balcony: !!data.balcony,
        pool: !!data.pool,
        price: Number(data.price),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return normalizeBooking(inserted, "Room");
  },

  async createTableBooking(data, user) {
    const { data: inserted, error } = await supabase
      .from("table_bookings")
      .insert({
        customer_id: user.id,
        customer_email: user.email,
        customer_name: data.name,
        name: data.name,
        age: Number(data.age),
        contact: data.contact,
        floor: Number(data.floor),
        seats: Number(data.seats),
        price: Number(data.price),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return normalizeBooking(inserted, "Table");
  },

  async getRoomBookingsByUser(userId) {
    const { data, error } = await supabase
      .from("room_bookings")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map((row) => normalizeBooking(row, "Room"));
  },

  async getTableBookingsByUser(userId) {
    const { data, error } = await supabase
      .from("table_bookings")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map((row) => normalizeBooking(row, "Table"));
  },

  async getRoomInventory() {
    const { data, error } = await supabase
      .from("room_inventory")
      .select("*")
      .eq("is_active", true)
      .order("floor", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getTableInventory() {
    const { data, error } = await supabase
      .from("table_inventory")
      .select("*")
      .eq("is_active", true)
      .order("floor", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getAllRoomBookings() {
    const { data } = await clientApi.get("/rooms");
    return data.map((row) => normalizeBooking(row, "Room"));
  },

  async getAllTableBookings() {
    const { data } = await clientApi.get("/tables");
    return data.map((row) => normalizeBooking(row, "Table"));
  },

  async updateBookingStatus(type, id, status) {
    const route = type === "room" ? "/rooms" : "/tables";
    const { data } = await clientApi.patch(`${route}/${id}/status`, { status });
    return normalizeBooking(data, type === "room" ? "Room" : "Table");
  },

  async getFloorOccupancy(floor) {
    const { data } = await clientApi.get(`/rooms/floor/${floor}`);
    return data;
  },
};
