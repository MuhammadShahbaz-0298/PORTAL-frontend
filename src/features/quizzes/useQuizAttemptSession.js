/* useQuizAttemptSession: persist answers and enforce the server-provided deadline.
 * Fullscreen is requested by a student gesture; browser window switching cannot be locked.
 */
import { useCallback, useRef, useState } from "react";
import { apiError } from "../../api/client";
import {
  saveQuizAttemptAnswers,
  startQuizAttempt,
  submitAttempt,
} from "../../api/quizzes";
import { useQuizCountdown } from "./useQuizCountdown";
import { useQuizAutoSubmit } from "./useQuizAutoSubmit";
import { useQuizFocusControl } from "./useQuizFocusControl";

const IN_PROGRESS = "inProgress";

export function useQuizAttemptSession(quizId, questionCount) {
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState(() => Array(questionCount).fill(-1));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const attemptRef = useRef(null);
  const answersRef = useRef(answers);
  const saveQueueRef = useRef(Promise.resolve());
  const isInProgress = attempt?.status === IN_PROGRESS;
  const remainingSeconds = useQuizCountdown(attempt?.expiresAt);

  const updateAttempt = useCallback(value => {
    attemptRef.current = value;
    setAttempt(value);
  }, []);

  const {
    focusWarning,
    requestFullscreen,
    resumeFullscreen,
  } = useQuizFocusControl({
    isActive: isInProgress,
    quizId,
    updateAttempt,
    setError,
  });

  const start = useCallback(async () => {
    setError("");
    setStarting(true);
    try {
      if (!(await requestFullscreen())) {
        setError(
          "Could not enter fullscreen. Allow fullscreen access and try again."
        );
        return false;
      }
      const response = await startQuizAttempt(quizId);
      const nextAttempt = response.data;
      const nextAnswers = Array.from({ length: questionCount }, (_, index) =>
        Number.isInteger(nextAttempt.answers?.[index])
          ? nextAttempt.answers[index]
          : -1
      );
      answersRef.current = nextAnswers;
      setAnswers(nextAnswers);
      updateAttempt(nextAttempt);
      setCurrentIndex(0);
      return true;
    } catch (requestError) {
      setError(apiError(requestError));
      return false;
    } finally {
      setStarting(false);
    }
  }, [questionCount, quizId, requestFullscreen, updateAttempt]);

  const setAnswer = useCallback(
    (index, optionIndex) => {
      const nextAnswers = [...answersRef.current];
      nextAnswers[index] = optionIndex;
      answersRef.current = nextAnswers;
      setAnswers(nextAnswers);
      setError("");

      saveQueueRef.current = saveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (attemptRef.current?.status !== IN_PROGRESS) return;
          const response = await saveQuizAttemptAnswers(quizId, {
            answers: nextAnswers,
          });
          updateAttempt(response.data);
          setError("");
        })
        .catch(requestError => {
          setError(apiError(requestError));
        });
    },
    [quizId, updateAttempt]
  );

  const submit = useCallback(async () => {
    if (submitting || attemptRef.current?.status !== IN_PROGRESS) {
      return false;
    }

    setSubmitting(true);
    setError("");
    try {
      await saveQueueRef.current;
      if (attemptRef.current?.status !== IN_PROGRESS) return true;
      const response = await submitAttempt(quizId, {
        answers: answersRef.current,
      });
      updateAttempt(response.data);
      return true;
    } catch (requestError) {
      setError(apiError(requestError));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [quizId, submitting, updateAttempt]);

  useQuizAutoSubmit(attempt?.status, remainingSeconds, submit);

  return {
    attempt,
    answers,
    answeredCount: answers.filter(answer => answer >= 0).length,
    currentIndex,
    error,
    focusWarning,
    focusViolationCount: attempt?.focusViolationCount || 0,
    remainingSeconds,
    setAnswer,
    setCurrentIndex,
    start,
    starting,
    submitting,
    submit,
    resumeFullscreen,
  };
}
