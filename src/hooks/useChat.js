import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// Owns all chatbot state: the conversation list, the open conversation's full
// message history, and the send/ create / delete calls against /api/v2/chat.
export function useChat() {
  const { user, apiBase } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${apiBase}/chat${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // A quota error is a "come back later", not a broken app. Say so in
        // those terms instead of surfacing the raw upstream message.
        if (res.status === 429) {
          throw new Error(
            "The AI is rate limited right now. Please try again in a little while.",
          );
        }
        throw new Error(body.message || body.error || "Request failed");
      }
      return res.json();
    },
    [apiBase],
  );

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const body = await request("/conversations");
      setConversations(body.data || []);
    } catch (err) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoadingList(false);
    }
  }, [request]);

  // Reset everything on logout so the next user never sees these threads.
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveId(null);
      setMessages([]);
      setError(null);
      return;
    }
    loadConversations();
  }, [user, loadConversations]);

  const openConversation = useCallback(
    async (id) => {
      setActiveId(id);
      setMessages([]);
      setError(null);
      setLoadingThread(true);
      try {
        const body = await request(`/conversations/${id}`);
        setMessages(body.data?.messages || []);
      } catch (err) {
        setError(err.message || "Failed to open conversation");
      } finally {
        setLoadingThread(false);
      }
    },
    [request],
  );

  // A new chat is only created on the server once the first message is sent,
  // so clicking "New chat" never litters the list with empty threads.
  const startNewConversation = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setError(null);
  }, []);

  const deleteConversation = useCallback(
    async (id) => {
      try {
        await request(`/conversations/${id}`, { method: "DELETE" });
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (id === activeId) {
          setActiveId(null);
          setMessages([]);
        }
      } catch (err) {
        setError(err.message || "Failed to delete conversation");
      }
    },
    [request, activeId],
  );

  const sendMessage = useCallback(
    async (question) => {
      const trimmed = String(question || "").trim();
      if (!trimmed || sending) return;

      setError(null);
      setSending(true);

      // Show the user's message immediately; swap in the saved copy on success.
      const optimistic = {
        _id: `pending-${Date.now()}`,
        role: "user",
        content: trimmed,
        sources: [],
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const body = await request("/messages", {
          method: "POST",
          body: JSON.stringify({
            question: trimmed,
            ...(activeId ? { conversationId: activeId } : {}),
          }),
        });

        const data = body.data || {};
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== optimistic._id),
          data.userMessage,
          data.assistantMessage,
        ]);

        if (!activeId && data.conversationId) setActiveId(data.conversationId);
        await loadConversations();
      } catch (err) {
        // Roll the optimistic message back: the server saved nothing.
        setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
        setError(err.message || "Failed to send message");
      } finally {
        setSending(false);
      }
    },
    [request, activeId, sending, loadConversations],
  );

  return {
    conversations,
    activeId,
    messages,
    loadingList,
    loadingThread,
    sending,
    error,
    setError,
    openConversation,
    startNewConversation,
    deleteConversation,
    sendMessage,
  };
}
