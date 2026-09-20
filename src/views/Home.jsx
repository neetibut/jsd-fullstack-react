import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserTable } from "../components/UserTable";
import { AdminTable } from "../components/AdminTable";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, authLoading, apiBase } = useAuth();
  const [view, setView] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiBase}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const response = await res.json();
      setUsers(response.data);
    } catch {
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]); // fetchUsers only changes when apiBase changes

  return (
    <div className="min-h-screen p-6 gap-y-6 flex flex-col justify-start w-full">
      <section className="mt-20 text-5xl font-extrabold text-center">
        <h1>Generation Thailand</h1>
        <h1>React Assessment</h1>
      </section>
      <section className="flex justify-center gap-x-3 font-bold">
        <button
          onClick={() => setView("user")}
          className=" p-5 bg-sky-200 flex rounded-2xl cursor-pointer border hover:bg-sky-300"
        >
          User Section
        </button>
        <button
          onClick={() => setView("admin")}
          className=" p-5 bg-rose-100 flex rounded-2xl cursor-pointer border hover:bg-rose-200"
        >
          Admin Section
        </button>
      </section>

      <section className="w-full flex justify-center">
        <div className="w-full max-w-3xl bg-white border rounded-2xl p-5 text-center">
          <div className="font-bold text-lg">Ask AI about users</div>
          {authLoading ? (
            <div className="text-sm mt-2">Checking login…</div>
          ) : user ? (
            <>
              <p className="text-sm text-gray-600 mt-1">
                Chat with your data — ask a question, then keep asking
                follow-ups.
              </p>
              <Link
                to="/chat"
                className="inline-block mt-3 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded"
              >
                Open AI Chat
              </Link>
            </>
          ) : (
            <div className="text-sm mt-2 font-bold">
              Please log in to use the AI feature
            </div>
          )}
        </div>
      </section>
      <section className="w-full flex justify-center gap-x-3">
        {view === "user" ? (
          <section className=" p-5  flex">
            <UserTable users={users} />
          </section>
        ) : view === "admin" ? (
          <section className=" p-5  flex">
            {authLoading ? (
              <div className="text-xl font-bold">Checking login…</div>
            ) : user ? (
              <AdminTable
                users={users}
                setUsers={setUsers}
                fetchUsers={fetchUsers}
                API={`${apiBase}/users`}
              />
            ) : (
              <div className="text-xl font-bold">
                Please log in to access Admin Section
              </div>
            )}
          </section>
        ) : null}
      </section>
    </div>
  );
}
