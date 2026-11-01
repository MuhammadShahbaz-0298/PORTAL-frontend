/* Layout measurements shared by the shell, bottom navigation, and toasts. */
// Why: one source for the bar height keeps toasts and page content clear of the nav.
export const BOTTOM_NAV_HEIGHT_CLASS = "h-16";
export const BOTTOM_NAV_SAFE_CLASS = "pb-[env(safe-area-inset-bottom)]";
export const MOBILE_CONTENT_CLEARANCE_CLASS =
  "pb-[calc(4rem_+_env(safe-area-inset-bottom)_+_1.5rem)] md:pb-12";
export const MOBILE_TOAST_OFFSET_CLASS =
  "bottom-[calc(4rem_+_env(safe-area-inset-bottom)_+_1rem)] sm:bottom-auto";
