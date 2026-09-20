import { useState } from "react";

// One turn in the thread. Assistant turns can expand the users that were
// retrieved to ground the answer.
export function ChatMessage({ message }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";
  const sources = Array.isArray(message.sources) ? message.sources : [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2 whitespace-pre-wrap ${
            isUser
              ? "bg-sky-500 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm border"
          } ${message.pending ? "opacity-60" : ""}`}
        >
          {message.content}
        </div>

        {!isUser && sources.length ? (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              className="cursor-pointer text-xs text-sky-700 hover:text-sky-900 underline"
            >
              {showSources
                ? "Hide sources"
                : `Sources (${sources.length})`}
            </button>

            {showSources ? (
              <ul className="mt-1 text-xs text-gray-600 list-disc pl-5">
                {sources.map((s, idx) => (
                  <li key={s.userId || idx}>
                    {s.username} ({s.role})
                    {s.position ? ` — ${s.position}` : ""} — {s.email}
                    {typeof s.score === "number"
                      ? ` — score ${s.score.toFixed(3)}`
                      : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
