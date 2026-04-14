import { createContext, useContext, useEffect, useState } from "react";
import { clientApi, setManagementToken } from "../services/clientApi";
import { ensureCustomerProfile, updateCustomerProfile } from "../services/bookingService";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

function hydrateManagementSession() {
  try {
    const rawUser = localStorage.getItem("gr_management_user");
    const rawToken = localStorage.getItem("gr_management_token");
    if (!rawUser || !rawToken) return null;
    return { user: JSON.parse(rawUser), token: rawToken };
  } catch {
    return null;
  }
}

function toCustomerUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || authUser.user_metadata?.name || "",
    role: "CUSTOMER",
    authType: "customer",
    needsProfile: !(profile?.name || "").trim(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const syncCustomerUser = async (authUser) => {
      const profile = await ensureCustomerProfile(authUser);
      if (mounted) {
        setUser(toCustomerUser(authUser, profile));
      }
    };

    const boot = async () => {
      const managementSession = hydrateManagementSession();
      if (managementSession) {
        setManagementToken(managementSession.token);
        if (mounted) {
          setUser({ ...managementSession.user, authType: "management", needsProfile: false });
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (mounted) setLoading(false);
        return;
      }

      const authUser = data.session?.user;
      if (!authUser) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        await syncCustomerUser(authUser);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    boot();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        const managementSession = hydrateManagementSession();
        setUser(managementSession ? { ...managementSession.user, authType: "management", needsProfile: false } : null);
        return;
      }

      window.setTimeout(() => {
        syncCustomerUser(session.user).catch((error) => {
          console.error("Failed to sync customer session", error);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const sendCustomerOtp = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw new Error(error.message);
    return normalizedEmail;
  };

  const verifyCustomerOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });

    if (error) throw new Error(error.message);

    const profile = await ensureCustomerProfile(data.user);
    const nextUser = toCustomerUser(data.user, profile);
    setUser(nextUser);
    return nextUser;
  };

  const loginManagement = async (identifier, password) => {
    const { data } = await clientApi.post("/auth/login", {
      identifier,
      password,
      role: "MANAGEMENT",
    });

    const managementUser = {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name,
      role: data.role,
    };

    localStorage.setItem("gr_management_user", JSON.stringify(managementUser));
    localStorage.setItem("gr_management_token", data.token);
    setManagementToken(data.token);
    setUser({ ...managementUser, authType: "management", needsProfile: false });
    return managementUser;
  };

  const completeCustomerProfile = async ({ name }) => {
    if (!user || user.role !== "CUSTOMER") return null;
    const profile = await updateCustomerProfile(user.id, { name: name.trim() });
    const nextUser = { ...user, name: profile.name, needsProfile: false };
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    localStorage.removeItem("gr_management_user");
    localStorage.removeItem("gr_management_token");
    setManagementToken(null);
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendCustomerOtp,
        verifyCustomerOtp,
        loginManagement,
        completeCustomerProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
