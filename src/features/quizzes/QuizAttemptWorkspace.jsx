/* QuizAttemptWorkspace: render a timed, navigable student assessment.
 * The question map keeps answered and unanswered state visible throughout the attempt.
 */
import { useBlocker } from "@tanstack/react-router";
import Button from "../../components/ui/Button";
import QuizAttemptQuestion from "./QuizAttemptQuestion";
import QuizAttemptSummary from "./QuizAttemptSummary";
import QuizFocusWarning from "./QuizFocusWarning";
import QuizQuestionNavigator from "./QuizQuestionNavigator";
import QuizStartPanel from "./QuizStartPanel";
import QuizTimerHeader from "./QuizTimerHeader";
import { useQuizAttemptSession } from "./useQuizAttemptSession";
import { useQuizKeyboardLock } from "./useQuizKeyboardLock";

export default function QuizAttemptWorkspace({ quiz }) {
  const questions = quiz.questions || [];
  const session = useQuizAttemptSession(quiz._id || quiz.id, questions.length);
  const isInProgress = session.attempt?.status === "inProgress";
  useQuizKeyboardLock(isInProgress);
  useBlocker({
    shouldBlockFn: () => true,
    disabled: !isInProgress,
    enableBeforeUnload: isInProgress,
  });

  if (session.attempt?.status === "submitted") {
    return <QuizAttemptSummary attempt={session.attempt} />;
  }

  if (!session.attempt) {
    return (
      <QuizStartPanel
        quiz={quiz}
        questionCount={questions.length}
        error={session.error}
        starting={session.starting}
        onStart={session.start}
      />
    );
  }

  const currentIndex = Math.min(session.currentIndex, questions.length - 1);
  const unansweredCount = questions.length - session.answeredCount;

  return (
    <div className="grid gap-4">
      <QuizTimerHeader
        quizTitle={quiz.title}
        currentIndex={currentIndex}
        questionCount={questions.length}
        remainingSeconds={session.remainingSeconds}
      />

      {session.error ? (
        <p
          role="alert"
          className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
        >
          {session.error}
        </p>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="grid gap-4">
          <QuizAttemptQuestion
            index={currentIndex}
            question={questions[currentIndex]}
            selected={session.answers[currentIndex]}
            onSelect={optionIndex =>
              session.setAnswer(currentIndex, optionIndex)
            }
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                session.setCurrentIndex(index => Math.max(0, index - 1))
              }
              disabled={currentIndex === 0 || session.submitting}
            >
              Previous
            </Button>
            <div className="flex flex-wrap gap-2">
              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={() =>
                    session.setCurrentIndex(index =>
                      Math.min(questions.length - 1, index + 1)
                    )
                  }
                  disabled={session.submitting}
                >
                  Next
                </Button>
              ) : null}
              <Button
                onClick={session.submit}
                loading={session.submitting}
                disabled={!isInProgress}
              >
                {session.remainingSeconds === 0
                  ? "Retry submission"
                  : "Submit quiz"}
              </Button>
            </div>
          </div>
          {unansweredCount > 0 ? (
            <p className="text-right text-xs text-muted">
              {unansweredCount} unanswered question
              {unansweredCount === 1 ? "" : "s"} will be marked unanswered.
            </p>
          ) : null}
        </div>

        <QuizQuestionNavigator
          answers={session.answers}
          answeredCount={session.answeredCount}
          currentIndex={currentIndex}
          onNavigate={session.setCurrentIndex}
          questionCount={questions.length}
        />
      </div>

      {session.focusWarning ? (
        <QuizFocusWarning
          error={session.error}
          focusViolationCount={session.focusViolationCount}
          onResume={session.resumeFullscreen}
        />
      ) : null}
    </div>
  );
}
