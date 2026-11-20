/* Quizzes service. */
import client from "./client";
export const listQuizzes = params => client.get("/quizzes", { params });
export const getQuiz = id => client.get(`/quizzes/${id}`);
export const createQuiz = payload => client.post("/quizzes", payload);
export const updateQuiz = (id, payload) =>
  client.patch(`/quizzes/${id}`, payload);
export const submitAttempt = (id, payload) =>
  client.post(`/quizzes/${id}/attempt`, payload);
export const startQuizAttempt = id =>
  client.post(`/quizzes/${id}/attempt/start`);
export const saveQuizAttemptAnswers = (id, payload) =>
  client.patch(`/quizzes/${id}/attempt`, payload);
export const recordQuizAttemptViolation = id =>
  client.post(`/quizzes/${id}/attempt/violation`);
export const listAttempts = (id, params) =>
  client.get(`/quizzes/${id}/attempts`, { params });
export const getQuestionTemplate = () =>
  client.get("/quizzes/questions/template", { responseType: "blob" });
export const importQuestions = file => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/quizzes/questions/import", formData);
};
