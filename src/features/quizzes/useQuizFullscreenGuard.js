/* useQuizFullscreenGuard: request fullscreen and flag focus/fullscreen exits.
 * The browser retains control of system shortcuts and window switching.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export function useQuizFullscreenGuard(isActive, onViolation) {
  const [focusWarning, setFocusWarning] = useState(false);
  const returnedFromHiddenTab = useRef(false);
  const violationLatched = useRef(false);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  const requestFullscreen = useCallback(async () => {
    if (document.fullscreenElement) return true;
    if (!document.documentElement.requestFullscreen) return false;
    try {
      await document.documentElement.requestFullscreen();
      return true;
    } catch {
      return false;
    }
  }, []);

  const resumeFullscreen = useCallback(async () => {
    const entered = await requestFullscreen();
    if (entered) {
      violationLatched.current = false;
      setFocusWarning(false);
    }
    return entered;
  }, [requestFullscreen]);

  useEffect(() => {
    const reportViolation = () => {
      if (!isActive || violationLatched.current) return;
      violationLatched.current = true;
      setFocusWarning(true);
      onViolationRef.current?.();
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) reportViolation();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        returnedFromHiddenTab.current = true;
      } else if (returnedFromHiddenTab.current) {
        returnedFromHiddenTab.current = false;
        reportViolation();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isActive]);

  return { focusWarning, requestFullscreen, resumeFullscreen };
}
