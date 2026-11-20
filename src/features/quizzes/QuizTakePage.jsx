/* QuizTakePage: resolve access and load the quiz for the student attempt route.
 * The timed assessment UI is kept in QuizAttemptWorkspace.
 */
import { useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "@tanstack/react-router";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import QuizAttemptWorkspace from "./QuizAttemptWorkspace";

function QuizTakePage({ quizId, user, quizzes, loadOne }) {
  useEffect(() => {
    if (user?.role === "student") loadOne(quizId);
  }, [loadOne, quizId, user?.role]);

  const quiz =
    quizzes.current &&
    String(quizzes.current._id || quizzes.current.id) === String(quizId)
      ? quizzes.current
      : null;

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Assessment"
        title={quiz?.title || "Take quiz"}
        description="Complete this fullscreen assessment using the mouse. Leaving fullscreen counts as a warning."
      />
      {user?.role !== "student" ? (
        <Card>
          <EmptyState
            title="Student quiz page"
            text="Sign in as a student enrolled in this quiz's batch to submit an attempt."
          />
        </Card>
      ) : quizzes.loading && !quiz ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Loading quiz" className="text-brand" />
        </div>
      ) : quizzes.error ? (
        <Card>
          <ErrorState message={quizzes.error} onRetry={() => loadOne(quizId)} />
        </Card>
      ) : !quiz ? (
        <Card>
          <ErrorState
            message={quizzes.error || "This quiz is unavailable."}
            onRetry={() => loadOne(quizId)}
          />
        </Card>
      ) : quiz.questions?.length ? (
        <QuizAttemptWorkspace quiz={quiz} />
      ) : (
        <Card>
          <EmptyState
            title="No questions in this quiz"
            text="Ask your teacher to update the quiz."
          />
        </Card>
      )}
    </div>
  );
}

const ConnectedQuizTakePage = connect(
  state => ({ user: state.auth.user, quizzes: state.quizzes }),
  dispatch => ({
    loadOne: dispatch.quizzes.loadOne,
  })
)(QuizTakePage);

export default function QuizTakeRoute() {
  const { quizId } = useParams({ strict: false });
  return <ConnectedQuizTakePage key={quizId} quizId={quizId} />;
}
