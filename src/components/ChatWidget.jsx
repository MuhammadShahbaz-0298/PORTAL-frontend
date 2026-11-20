import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { hasPermission } from "../lib/permissions";

const STUDENT_SUGGESTIONS = [
  "What work is due soon?",
  "How do I take a quiz?",
  "How is my attendance?",
];
const STAFF_SUGGESTIONS = [
  "How do I review submissions?",
  "How do I mark attendance?",
  "How do I create an announcement?",
];

const timeLabel = value =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ChatWidget() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { open, messages, loading, error } = useSelector(state => state.chat);
  const isStudent = user?.role === "student";
  const suggestions = isStudent ? STUDENT_SUGGESTIONS : STAFF_SUGGESTIONS;
  const [question, setQuestion] = useState("");
  const endRef = useRef(null);
  const canUse = hasPermission(user, "assistant.use", ["admin", "student"]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages, loading]);

  if (!canUse) return null;

  const submit = async event => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    dispatch.chat.setError("");
    setQuestion("");
    await dispatch.chat.ask({ question: trimmed });
  };

  const askSuggestion = async suggestion => {
    if (loading) return;
    await dispatch.chat.ask({ question: suggestion });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <section
          aria-label={isStudent ? "Student assistant" : "Portal assistant"}
          className="flex h-[min(32rem,calc(100vh-6rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card"
        >
          <header className="flex items-center gap-3 border-b border-line bg-brand-soft px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white">
              <Bot size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold text-ink">
                {isStudent ? "Student assistant" : "Portal assistant"}
                <Sparkles size={13} aria-hidden="true" className="text-brand" />
              </p>
              <p className="truncate text-xs text-muted">
                {isStudent
                  ? "Answers use only your own progress"
                  : "Ask for help using your portal"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch.chat.reset()}
              aria-label="Start a new conversation"
              title="Start a new conversation"
              className="rounded-control p-1.5 text-muted transition hover:bg-surface hover:text-ink"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => dispatch.chat.setOpen(false)}
              aria-label="Close assistant"
              className="rounded-control p-1.5 text-muted transition hover:bg-surface hover:text-ink"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map(message => {
              const assistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${assistant ? "" : "flex-row-reverse"}`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      assistant
                        ? "bg-brand-soft text-brand"
                        : "bg-canvas text-muted"
                    }`}
                  >
                    {assistant ? (
                      <Bot size={14} aria-hidden="true" />
                    ) : (
                      <User size={14} aria-hidden="true" />
                    )}
                  </span>
                  <div
                    className={`max-w-[82%] rounded-card px-3 py-2 text-sm ${
                      assistant
                        ? "rounded-tl-sm bg-canvas text-ink"
                        : "rounded-tr-sm bg-brand text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        assistant ? "text-muted" : "text-white/70"
                      }`}
                    >
                      {timeLabel(message.sentAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-brand">
                  <Bot size={14} aria-hidden="true" />
                </span>
                <span className="rounded-card rounded-tl-sm bg-canvas px-3 py-2">
                  Thinking…
                </span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          {messages.length === 1 ? (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => askSuggestion(suggestion)}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-brand transition hover:bg-brand-soft disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={submit} className="border-t border-line p-3">
            {error ? (
              <p
                role="alert"
                className="mb-2 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"
              >
                {error}
              </p>
            ) : null}
            <div className="flex items-end gap-2">
              <label htmlFor="assistant-question" className="sr-only">
                Ask the assistant
              </label>
              <textarea
                id="assistant-question"
                value={question}
                rows={2}
                disabled={loading}
                onChange={event => {
                  setQuestion(event.target.value);
                  if (error) dispatch.chat.setError("");
                }}
                onKeyDown={event => {
                  if (event.key === "Enter" && !event.shiftKey) submit(event);
                }}
                placeholder={
                  isStudent
                    ? "Ask about your progress…"
                    : "Ask about the portal…"
                }
                className="max-h-24 flex-1 resize-none rounded-control border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                aria-label="Send question"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Send size={15} aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => dispatch.chat.setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:opacity-90"
        >
          <MessageCircle size={17} aria-hidden="true" />
          Ask assistant
        </button>
      )}
    </div>
  );
}
