/* Card: the white surface used for every block of content. */
import { classNames } from "../../lib/classNames";

export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={classNames(
        "rounded-card border border-line bg-surface shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={classNames("p-4 sm:p-6", className)}>{children}</div>;
}
