import { askAssistant } from "../../api/assistant";
import { apiError } from "../../api/client";

const greeting =
  "Hi! Ask me about your assignments, quizzes, submissions, attendance, or grades.";

const makeMessage = (role, content) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
  sentAt: new Date().toISOString(),
});

const initialMessages = () => [makeMessage("assistant", greeting)];

export const chat = {
  state: {
    open: false,
    messages: initialMessages(),
    loading: false,
    error: "",
  },

  reducers: {
    setOpen(state, open) {
      return { ...state, open };
    },
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    addMessage(state, message) {
      return { ...state, messages: [...state.messages, message] };
    },
    reset(state) {
      return { ...state, messages: initialMessages(), error: "" };
    },
  },

  effects: () => ({
    async ask({ question }) {
      const trimmed = String(question || "").trim();
      if (!trimmed) return false;
      this.addMessage(makeMessage("user", trimmed));
      this.setError("");
      this.setLoading(true);
      try {
        const response = await askAssistant(trimmed);
        const answer =
          response?.data?.answer ||
          response?.answer ||
          "I could not find an answer. Please try a different question.";
        this.addMessage(makeMessage("assistant", answer));
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      } finally {
        this.setLoading(false);
      }
    },
  }),
};
