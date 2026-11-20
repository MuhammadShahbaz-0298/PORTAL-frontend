/* useQuizAutoSubmit: finalize once when the server deadline reaches zero.
 * The hook keeps a fresh submit handler without restarting the deadline effect.
 */
import { useEffect, useRef } from "react";

export function useQuizAutoSubmit(status, remainingSeconds, submit) {
  const submitRef = useRef(submit);
  const submittedRef = useRef(false);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  useEffect(() => {
    if (
      status !== "inProgress" ||
      remainingSeconds !== 0 ||
      submittedRef.current
    ) {
      return;
    }
    submittedRef.current = true;
    submitRef.current();
  }, [status, remainingSeconds]);
}
