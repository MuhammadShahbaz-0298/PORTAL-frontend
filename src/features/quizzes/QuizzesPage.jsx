/* QuizzesPage: list quizzes with staff results and archive actions.
 * Students see only the quizzes they can attempt.
 */
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import { hasPermission } from "../../lib/permissions";
import QuizCard from "./QuizCard";
import QuizResultsPanel from "./QuizResultsPanel";

function QuizzesPage({ quizzes, user, load, archive, clearMessages }) {
  const navigate = useNavigate();
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const canManage = hasPermission(user, "quiz.manage", ["admin", "teacher"]);
  const selectedQuiz = quizzes.items.find(
    quiz => String(quiz._id || quiz.id) === selectedQuizId
  );

  useEffect(() => {
    load();
  }, [load]);

  const archiveQuiz = async quiz => {
    const quizId = quiz._id || quiz.id;
    const confirmed = await confirmDialog({
      title: "Archive quiz?",
      text: "Students will no longer see it, but existing attempts and scores will be preserved.",
      confirmText: "Archive quiz",
    });
    if (!confirmed) return;

    const archived = await archive(quizId);
    if (archived && selectedQuizId === String(quizId)) {
      setSelectedQuizId("");
    }
  };

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Assessments"
        title="Quizzes"
        description={
          canManage
            ? "Manage quizzes, archive old work, and review student scores."
            : "Available quizzes for you."
        }
        action={
          canManage ? (
            <Button onClick={() => navigate({ to: "/quiz-builder" })}>
              <Plus size={16} aria-hidden="true" />
              New quiz
            </Button>
          ) : null
        }
      />
      <Toast
        message={quizzes.pageError || quizzes.notice}
        tone={quizzes.pageError ? "error" : "success"}
        onClose={clearMessages}
      />
      {quizzes.error ? (
        <Card className="mb-4">
          <ErrorState message={quizzes.error} onRetry={load} />
        </Card>
      ) : null}
      {quizzes.loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Loading quizzes" className="text-brand" />
        </div>
      ) : quizzes.items.length ? (
        <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.items.map(quiz => {
            const quizId = String(quiz._id || quiz.id);
            return (
              <QuizCard
                key={quizId}
                quiz={quiz}
                canManage={canManage}
                resultsOpen={selectedQuizId === quizId}
                archiving={quizzes.saving}
                onTake={id =>
                  navigate({
                    to: "/quizzes/$quizId",
                    params: { quizId: String(id) },
                  })
                }
                onShowResults={id =>
                  setSelectedQuizId(current => (current === id ? "" : id))
                }
                onArchive={archiveQuiz}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title={canManage ? "No quizzes yet" : "No quizzes available"}
            text={
              canManage
                ? "Create a quiz to assess your students."
                : "When your teacher publishes a quiz, it will appear here."
            }
            action={
              canManage ? (
                <Button onClick={() => navigate({ to: "/quiz-builder" })}>
                  <Plus size={16} aria-hidden="true" />
                  Create quiz
                </Button>
              ) : null
            }
          />
        </Card>
      )}
      {canManage && selectedQuiz ? (
        <QuizResultsPanel
          key={selectedQuiz._id || selectedQuiz.id}
          quizId={selectedQuiz._id || selectedQuiz.id}
          quizTitle={selectedQuiz.title || "Untitled quiz"}
          onClose={() => setSelectedQuizId("")}
        />
      ) : null}
    </div>
  );
}

const mapState = state => ({ quizzes: state.quizzes, user: state.auth.user });
const mapDispatch = dispatch => ({
  load: dispatch.quizzes.load,
  archive: dispatch.quizzes.archive,
  clearMessages: dispatch.quizzes.clearMessages,
});
export default connect(mapState, mapDispatch)(QuizzesPage);
