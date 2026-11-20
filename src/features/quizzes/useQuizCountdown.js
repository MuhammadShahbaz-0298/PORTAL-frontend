/* useQuizCountdown: display a deadline using the server-provided expiry time.
 * The timer is derived from absolute time so background tabs cannot pause it.
 */
import { useEffect, useState } from "react";

export function useQuizCountdown(expiresAt) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const updateTime = () => setNow(Date.now());
    const initialTimer = window.setTimeout(updateTime, 0);
    const interval = window.setInterval(updateTime, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  if (!expiresAt || !now) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
}
