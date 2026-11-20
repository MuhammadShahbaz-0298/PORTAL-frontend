/* DataList: one list that becomes cards on phones and a table from md upward. */
import { classNames } from "../../lib/classNames";
import Card from "./Card";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Spinner from "./Spinner";
import Table from "./Table";

function DefaultCard({ row, columns }) {
  return (
    <dl className="grid gap-2">
      {columns.map(column => {
        const value =
          typeof column.render === "function"
            ? column.render(row)
            : row?.[column.key];
        if (value === null || value === undefined || value === "") return null;
        return (
          <div
            key={column.key || column.label}
            className="flex items-start justify-between gap-3"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {column.label || column.key}
            </dt>
            <dd className="min-w-0 text-right text-sm text-ink">{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

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
  tableClassName = "",
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
    <div className="md:rounded-card">
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
                {typeof renderCard === "function" ? (
                  renderCard(row)
                ) : (
                  <DefaultCard row={row} columns={columns} />
                )}
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
          className={tableClassName}
        />
      </div>
    </div>
  );
}
