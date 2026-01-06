import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";

export function Layout() {
  const apiBase =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api/v2/users";

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        const res = await axios.get(`${apiBase}/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [apiBase]);

  const login = async ({ email, password }) => {
    setAuthError(null);
    try {
      const res = await axios.post(
        `${apiBase}/auth/cookie/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(res.data.user);
      return true;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message;
      setAuthError(message || "Login failed");
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await axios.post(
        `${apiBase}/auth/cookie/logout`,
        {},
        { withCredentials: true }
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <div>
      <Navbar
        user={user}
        authLoading={authLoading}
        authError={authError}
        login={login}
        logout={logout}
      />
      <section className="bg-amber-200 flex justify-center">
        <Outlet context={{ user, authLoading, apiBase }} />
      </section>
    </div>
  );
}
