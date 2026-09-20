import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "../components/ChatMessage";
import { ConversationList } from "../components/ConversationList";

// Semantic lookups the retrieval design can actually answer. Aggregate
// questions ("how many users?") are deliberately absent: the model only ever
// sees the top-K matches, so it cannot count the table.
const SUGGESTIONS = [
  "Who are the admins?",
  "Who works on security?",
  "Who could help with data analysis?",
];

export default function Chat() {
  const { user, authLoading } = useAuth();
  const {
    conversations,
    activeId,
    messages,
    loadingList,
    loadingThread,
    sending,
    error,
    openConversation,
    startNewConversation,
    deleteConversation,
    sendMessage,
  } = useChat();

  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  // Keep the newest turn in view as the thread grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q || sending) return;
    setDraft("");
    await sendMessage(q);
  };

  const askSuggestion = async (text) => {
    if (sending) return;
    setDraft("");
    await sendMessage(text);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full p-6 text-xl font-bold">
        Checking login…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full p-6 flex flex-col items-center gap-y-3">
        <h1 className="mt-20 text-4xl font-extrabold">AI Chat</h1>
        <p className="text-xl font-bold">Please log in to use the chatbot</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 flex flex-col gap-y-4">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold">Ask AI about users</h1>
        <p className="text-gray-600 mt-1">
          Grounded in your database with vector search — follow-up questions
          welcome.
        </p>
      </section>

      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          loading={loadingList}
          onSelect={openConversation}
          onNew={startNewConversation}
          onDelete={deleteConversation}
        />

        <section className="flex-1 border rounded-2xl bg-white p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto min-h-[45vh] max-h-[60vh] flex flex-col gap-y-3 pr-1">
            {loadingThread ? (
              <div className="text-sm text-gray-500">Loading conversation…</div>
            ) : messages.length === 0 ? (
              <div className="m-auto text-center flex flex-col gap-y-3">
                <div className="text-gray-500">
                  Start the conversation — try one of these:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => askSuggestion(s)}
                      className="cursor-pointer text-sm border rounded-full px-3 py-1 hover:bg-gray-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => <ChatMessage key={m._id} message={m} />)
            )}

            {sending ? (
              <div className="flex justify-start">
                <div className="bg-gray-100 border rounded-2xl rounded-bl-sm px-4 py-2 text-gray-500">
                  Thinking…
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          {error ? (
            <div className="mt-3 text-sm bg-rose-100 border border-rose-200 text-rose-900 p-3 rounded">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-3 flex gap-x-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                messages.length
                  ? "Ask a follow-up…"
                  : 'e.g. "Who are the admins?"'
              }
              className="flex-1 border rounded px-3 py-2"
              maxLength={4000}
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="cursor-pointer bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white px-4 py-2 rounded"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
