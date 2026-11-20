/* QuizQuestionImportControls: import and download quiz question workbooks.
 * Imported rows join the current draft and remain editable before saving.
 */
import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { apiError } from "../../api/client";
import { getQuestionTemplate, importQuestions } from "../../api/quizzes";
import Button from "../../components/ui/Button";

export default function QuizQuestionImportControls({ questions, onImport }) {
  const fileInput = useRef(null);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleFile = async event => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError("");
    setNotice("");

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Choose an Excel workbook with the .xlsx extension.");
      input.value = "";
      return;
    }

    setImporting(true);
    try {
      const response = await importQuestions(file);
      const importedQuestions = response.data?.questions;
      if (!Array.isArray(importedQuestions) || !importedQuestions.length) {
        setError("The workbook did not contain any valid questions.");
        return;
      }

      const existingQuestions = questions.filter(
        question =>
          question.text.trim() || question.options.some(option => option.trim())
      );
      onImport([...existingQuestions, ...importedQuestions]);
      setNotice(
        `Added ${importedQuestions.length} questions. Review or edit them before creating the quiz.`
      );
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setImporting(false);
      input.value = "";
    }
  };

  const downloadTemplate = async () => {
    setError("");
    setNotice("");
    setDownloading(true);
    try {
      const response = await getQuestionTemplate();
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "quiz-questions-template.xlsx";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="grid gap-2 rounded-card border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          loading={importing}
          disabled={downloading}
          onClick={() => fileInput.current?.click()}
        >
          <Upload size={16} aria-hidden="true" />
          Import questions (.xlsx)
        </Button>
        <Button
          variant="ghost"
          loading={downloading}
          disabled={importing}
          onClick={downloadTemplate}
        >
          <Download size={16} aria-hidden="true" />
          Download example
        </Button>
        <FileSpreadsheet
          size={18}
          className="text-success"
          aria-hidden="true"
        />
        <input
          ref={fileInput}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={handleFile}
          aria-label="Choose quiz questions Excel workbook"
        />
      </div>
      <p className="text-xs text-muted">
        Import adds questions to this draft. Use the example workbook, then
        review and edit each question before saving.
      </p>
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm font-medium text-success">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
