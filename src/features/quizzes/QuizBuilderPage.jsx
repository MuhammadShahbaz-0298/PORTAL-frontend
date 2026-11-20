/* QuizBuilderPage: create and assign a multiple-choice quiz to a batch.
 * QuizQuestionEditor owns the individual question and answer-option controls.
 */
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import Toast from "../../components/ui/Toast";
import QuizQuestionEditor from "./QuizQuestionEditor";
import QuizQuestionImportControls from "./QuizQuestionImportControls";
import QuizSettingsCard from "./QuizSettingsCard";
import { QUIZ_MAX_TIME_LIMIT_MINUTES } from "../../constants/app";

const EMPTY_QUESTION = { text: "", options: ["", ""], correctIndex: null };

function QuizBuilderPage({
  quizzes,
  batches,
  load,
  loadBatches,
  create,
  clearMessages,
}) {
  const [title, setTitle] = useState("");
  const [batchId, setBatchId] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("");
  const [validationError, setValidationError] = useState("");
  const [questions, setQuestions] = useState([{ ...EMPTY_QUESTION }]);

  useEffect(() => {
    load();
    loadBatches();
  }, [load, loadBatches]);

  const handleQuestionsChange = nextQuestions => {
    setValidationError("");
    setQuestions(nextQuestions);
  };

  const submit = async event => {
    event.preventDefault();
    const preparedQuestions = questions.map(question => ({
      text: question.text.trim(),
      options: question.options.map(option => option.trim()),
      correctIndex:
        question.correctIndex === null ? -1 : Number(question.correctIndex),
    }));

    const hasInvalidQuestion = preparedQuestions.some(
      question =>
        !question.text ||
        question.options.length < 2 ||
        question.options.length > 6 ||
        question.options.some(option => !option) ||
        !Number.isInteger(question.correctIndex) ||
        question.correctIndex < 0 ||
        question.correctIndex >= question.options.length
    );
    const timeLimit = Number(timeLimitMinutes);
    if (
      !title.trim() ||
      !batchId ||
      !Number.isInteger(timeLimit) ||
      timeLimit < 1 ||
      timeLimit > QUIZ_MAX_TIME_LIMIT_MINUTES ||
      hasInvalidQuestion
    ) {
      setValidationError(
        "Complete the title, batch, valid time limit, question prompts, answer options, and correct answers."
      );
      return;
    }

    setValidationError("");
    const created = await create({
      title: title.trim(),
      batchId,
      timeLimitMinutes: timeLimit,
      questions: preparedQuestions,
    });
    if (created) {
      setTitle("");
      setBatchId("");
      setTimeLimitMinutes("");
      setQuestions([{ ...EMPTY_QUESTION }]);
    }
  };

  const message = quizzes.pageError || quizzes.notice;

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Assessments"
        title="Quiz builder"
        description="Build a multiple-choice quiz and assign it to one of your batches."
      />
      <Toast
        message={message}
        tone={quizzes.pageError ? "error" : "success"}
        onClose={clearMessages}
      />
      <form onSubmit={submit} className="grid gap-4">
        <QuizSettingsCard
          title={title}
          batchId={batchId}
          timeLimitMinutes={timeLimitMinutes}
          batches={batches}
          onTitleChange={value => {
            setValidationError("");
            setTitle(value);
          }}
          onBatchChange={value => {
            setValidationError("");
            setBatchId(value);
          }}
          onTimeLimitChange={value => {
            setValidationError("");
            setTimeLimitMinutes(value);
          }}
        />

        <QuizQuestionImportControls
          questions={questions}
          onImport={handleQuestionsChange}
        />
        <QuizQuestionEditor
          questions={questions}
          onChange={handleQuestionsChange}
        />
        <div className="grid justify-items-start gap-3">
          <Button
            type="submit"
            loading={quizzes.saving}
            disabled={!batches.items.length || batches.loading}
          >
            <Plus size={16} aria-hidden="true" />
            Create quiz
          </Button>
          {quizzes.formError ? (
            <p
              role="alert"
              className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
            >
              {quizzes.formError}
            </p>
          ) : null}
          {validationError ? (
            <p role="alert" className="text-sm font-medium text-danger">
              {validationError}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

const mapState = state => ({ quizzes: state.quizzes, batches: state.batches });
const mapDispatch = dispatch => ({
  load: dispatch.quizzes.load,
  loadBatches: dispatch.batches.load,
  create: dispatch.quizzes.create,
  clearMessages: dispatch.quizzes.clearMessages,
});
export default connect(mapState, mapDispatch)(QuizBuilderPage);
