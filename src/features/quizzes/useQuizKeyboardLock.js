/* useQuizKeyboardLock: require mouse input during an active assessment.
 * The browser and operating system still control reserved shortcuts.
 */
import { useEffect } from "react";

export function useQuizKeyboardLock(isActive) {
  useEffect(() => {
    if (!isActive) return undefined;

    const blockKeyboard = event => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const blockClipboard = event => event.preventDefault();

    ["keydown", "keypress", "keyup"].forEach(type =>
      document.addEventListener(type, blockKeyboard, true)
    );
    ["copy", "cut", "paste", "contextmenu"].forEach(type =>
      document.addEventListener(type, blockClipboard, true)
    );

    return () => {
      ["keydown", "keypress", "keyup"].forEach(type =>
        document.removeEventListener(type, blockKeyboard, true)
      );
      ["copy", "cut", "paste", "contextmenu"].forEach(type =>
        document.removeEventListener(type, blockClipboard, true)
      );
    };
  }, [isActive]);
}
