// Sidebar of past conversations. Selecting one loads its full history, which is
// what lets the model answer follow-ups across sessions.
export function ConversationList({
  conversations,
  activeId,
  loading,
  onSelect,
  onNew,
  onDelete,
}) {
  return (
    <aside className="w-full md:w-64 shrink-0 border rounded-2xl bg-white p-3 flex flex-col gap-y-2">
      <button
        onClick={onNew}
        className="cursor-pointer bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-3 py-2 font-bold"
      >
        + New chat
      </button>

      {loading ? (
        <div className="text-sm text-gray-500 px-1">Loading…</div>
      ) : conversations.length === 0 ? (
        <div className="text-sm text-gray-500 px-1">No conversations yet.</div>
      ) : (
        <ul className="flex flex-col gap-y-1 overflow-y-auto max-h-[60vh]">
          {conversations.map((c) => (
            <li key={c._id} className="group flex items-center gap-x-1">
              <button
                onClick={() => onSelect(c._id)}
                className={`cursor-pointer flex-1 text-left rounded-lg px-2 py-2 text-sm truncate ${
                  c._id === activeId
                    ? "bg-sky-100 font-bold"
                    : "hover:bg-gray-100"
                }`}
                title={c.title}
              >
                {c.title}
              </button>
              <button
                onClick={() => onDelete(c._id)}
                className="cursor-pointer text-gray-400 hover:text-rose-600 px-2 text-sm"
                aria-label={`Delete ${c.title}`}
                title="Delete conversation"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
