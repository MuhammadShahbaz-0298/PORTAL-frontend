import client from "./client";

export const askAssistant = question =>
  client.post("/ai/assistant/ask", { question });
