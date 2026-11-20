/* BulkImportModal: Excel upload with the backend's per-row report shown inline. */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function BulkImportModal() {
  const dispatch = useDispatch();
  const {
    importOpen,
    importReport,
    importError,
    importSaving,
    templateDownloading,
  } = useSelector(state => state.users);
  const [file, setFile] = useState(null);

  const close = () => {
    if (importSaving) return;
    setFile(null);
    dispatch.users.closeImport();
  };

  const submit = async event => {
    event.preventDefault();
    if (!file) return;
    await dispatch.users.bulkImport(file);
  };

  const succeeded = importReport
    ? importReport.filter(row => row.success).length
    : 0;

  return (
    <Modal
      open={importOpen}
      onClose={close}
      title="Bulk import users"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={importSaving}>
            Close
          </Button>
          <Button
            type="submit"
            form="bulk-import-form"
            loading={importSaving}
            disabled={!file}
          >
            Import Excel
          </Button>
        </>
      }
    >
      <form id="bulk-import-form" onSubmit={submit} className="grid gap-4">
        <p className="text-sm text-muted">
          Upload an .xlsx workbook. The first worksheet needs name, email,
          password, and role columns. Every row is checked by the backend.
        </p>

        <Button
          type="button"
          variant="secondary"
          onClick={() => dispatch.users.downloadImportTemplate()}
          loading={templateDownloading}
          className="justify-self-start"
        >
          Download Excel example
        </Button>

        <input
          id="bulk-import-file"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          aria-label="Excel workbook"
          onChange={event => setFile(event.target.files?.[0] || null)}
          className="block w-full rounded-control border border-line bg-canvas px-3 py-2 text-sm text-ink"
        />

        {importError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {importError}
          </div>
        ) : null}

        {importReport ? (
          <div>
            <p className="text-sm font-semibold text-ink">
              {succeeded} of {importReport.length} rows imported
            </p>
            <ul className="mt-2 max-h-64 space-y-1 overflow-auto">
              {importReport.map((row, index) => (
                <li
                  key={row.userId || index}
                  className="flex flex-wrap items-center gap-2 rounded-control border border-line bg-canvas px-2 py-1 text-sm"
                >
                  <Badge tone={row.success ? "success" : "danger"}>
                    {row.success ? "Success" : "Error"}
                  </Badge>
                  <span className="min-w-0 truncate text-ink">
                    {row.row?.email || row.row?.name || `Row ${index + 1}`}
                  </span>
                  {row.error ? (
                    <span className="text-xs text-danger">{row.error}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
