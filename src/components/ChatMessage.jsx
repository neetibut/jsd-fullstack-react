import { useState } from "react";

import { MarkdownText } from "./MarkdownText";

// One turn in the thread. Assistant turns show which tools the agent chose and
// can expand the users that were retrieved to ground the answer.
export function ChatMessage({ message }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";
  const sources = Array.isArray(message.sources) ? message.sources : [];
  // Empty on the non-agentic path and on messages saved before tools existed.
  const toolCalls = Array.isArray(message.toolCalls) ? message.toolCalls : [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser ? "whitespace-pre-wrap" : ""
          } ${
            isUser
              ? "bg-sky-500 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm border"
          } ${message.pending ? "opacity-60" : ""}`}
        >
          {isUser ? (
            message.content
          ) : (
            <MarkdownText>{message.content}</MarkdownText>
          )}
        </div>

        {!isUser && toolCalls.length ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {toolCalls.map((t, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-teal-50 text-teal-800 border border-teal-200 rounded-full px-2 py-0.5"
                title={`${t.name}(${JSON.stringify(t.args ?? {})})`}
              >
                {t.summary || t.name}
              </span>
            ))}
          </div>
        ) : null}

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
