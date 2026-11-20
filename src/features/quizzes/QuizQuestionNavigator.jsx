/* QuizQuestionNavigator: show answer state and jump to a question.
 * Button color and accessible names both indicate which questions are answered.
 */
import Card from "../../components/ui/Card";

export default function QuizQuestionNavigator({
  answers,
  answeredCount,
  currentIndex,
  onNavigate,
  questionCount,
}) {
  return (
    <Card className="grid gap-3 p-4 lg:sticky lg:top-4">
      <div>
        <h3 className="text-sm font-semibold text-ink">Question map</h3>
        <p className="mt-1 text-xs text-muted">
          {answeredCount} of {questionCount} answered
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-4">
        {answers.map((answer, index) => {
          const isAnswered = answer >= 0;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onNavigate(index)}
              aria-label={`Go to question ${index + 1}, ${isAnswered ? "answered" : "not answered"}`}
              aria-current={currentIndex === index ? "step" : undefined}
              className={`grid size-10 place-items-center rounded-control text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${
                isAnswered
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
              } ${currentIndex === index ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : "hover:brightness-95"}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-success" />
          Answered
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-danger" />
          Not answered
        </span>
      </div>
    </Card>
  );
}
