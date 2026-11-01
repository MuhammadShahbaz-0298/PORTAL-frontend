/* ConfirmDialog: the shared SweetAlert2 confirmation for destructive actions. */
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export async function confirmDialog({
  title,
  text,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-card font-sans",
      title: "text-lg font-semibold text-ink",
      htmlContainer: "text-sm text-muted",
      actions: "gap-3",
      confirmButton:
        "m-0 min-h-11 rounded-control bg-danger px-4 text-sm font-semibold text-white",
      cancelButton:
        "m-0 min-h-11 rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink",
    },
  });

  return result.isConfirmed;
}

export default confirmDialog;
