/* SubmissionDownload: one download action with its own progress state. */
import { Download } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import ProgressBar from "../../components/ui/ProgressBar";

export default function SubmissionDownload({ submission }) {
  const dispatch = useDispatch();
  const { downloadingId, downloadProgress } = useSelector(
    state => state.submissions
  );
  const id = submission._id || submission.id;
  const busy = String(downloadingId) === String(id);
  const locked = downloadingId !== null;

  if (busy) {
    return (
      <ProgressBar
        value={downloadProgress}
        label="Downloading"
        valueLabel="%"
        completedLabel="Saving file…"
      />
    );
  }

  return (
    <Button
      variant="secondary"
      disabled={locked}
      onClick={() =>
        dispatch.submissions.download({
          id,
          fileName: submission.fileName,
        })
      }
    >
      <Download size={15} aria-hidden="true" />
      Download
    </Button>
  );
}
