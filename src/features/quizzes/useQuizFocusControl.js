/* useQuizFocusControl: count focus violations and keep fullscreen recovery local.
 * The server submits the attempt after the warning limit is exceeded.
 */
import { useCallback, useRef } from "react";
import { apiError } from "../../api/client";
import { recordQuizAttemptViolation } from "../../api/quizzes";
import { useQuizFullscreenGuard } from "./useQuizFullscreenGuard";

export function useQuizFocusControl({
  isActive,
  quizId,
  updateAttempt,
  setError,
}) {
  const violationQueueRef = useRef(Promise.resolve());
  const reportViolation = useCallback(() => {
    violationQueueRef.current = violationQueueRef.current.then(async () => {
      try {
        const response = await recordQuizAttemptViolation(quizId);
        updateAttempt(response.data);
        setError("");
      } catch (requestError) {
        setError(apiError(requestError));
      }
    });
    return violationQueueRef.current;
  }, [quizId, setError, updateAttempt]);

  const fullscreen = useQuizFullscreenGuard(isActive, reportViolation);
  const { resumeFullscreen: requestResumeFullscreen } = fullscreen;
  const resumeFullscreen = useCallback(async () => {
    const entered = await requestResumeFullscreen();
    if (!entered) {
      setError(
        "Could not resume fullscreen. Allow fullscreen access and try again."
      );
    }
    return entered;
  }, [requestResumeFullscreen, setError]);

  return { ...fullscreen, resumeFullscreen, reportViolation };
}
