/* DataList: one list that becomes cards on phones and a table from md upward. */
import { classNames } from "../../lib/classNames";
import Card from "./Card";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Spinner from "./Spinner";
import Table from "./Table";

export default function DataList({
  columns = [],
  rows = [],
  rowKey = row => row.id || row._id,
  renderCard,
  loading = false,
  error = "",
  onRetry,
  emptyTitle,
  emptyText,
  onRowClick,
}) {
  if (loading) {
    return (
      <Card>
        <div className="flex justify-center px-6 py-16">
          <Spinner size="lg" label="Loading records" className="text-brand" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={onRetry} />
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card>
        <EmptyState title={emptyTitle} text={emptyText} />
      </Card>
    );
  }

  return (
    <div className="md:rounded-card md:border md:border-line md:bg-surface md:shadow-card">
      <ul className="grid gap-3 md:hidden">
        {rows.map(row => {
          const tappable = typeof onRowClick === "function";

          return (
            <li
              key={rowKey(row)}
              className="rounded-card border border-line bg-surface p-4 shadow-card"
            >
              <div
                role={tappable ? "button" : undefined}
                tabIndex={tappable ? 0 : undefined}
                onClick={tappable ? () => onRowClick(row) : undefined}
                onKeyDown={
                  tappable
                    ? event => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={classNames(tappable ? "cursor-pointer" : "")}
              >
                {renderCard(row)}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="hidden md:block">
        <Table
          columns={columns}
          rows={rows}
          rowKey={rowKey}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
}
