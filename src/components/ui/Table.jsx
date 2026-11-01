/* Table: the single table used by every list page. */
import { classNames } from "../../lib/classNames";

export default function Table({
  children,
  columns = [],
  rows = [],
  rowKey = row => row.id || row._id,
  onRowClick,
  className = "",
}) {
  return (
    <div className="overflow-x-auto">
      <table className={classNames("w-full border-collapse", className)}>
        {children || (
          <>
            <TableHead>
              {columns.map(column => (
                <TableHeader key={column.key} className={column.className}>
                  {column.label}
                </TableHeader>
              ))}
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? event => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map(column => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(row)
                        : (row[column.key] ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </>
        )}
      </table>
    </div>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <thead className={classNames("bg-canvas", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <th
      scope="col"
      className={classNames(
        "px-3 py-3.5 text-left text-sm font-semibold text-ink",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className = "" }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({
  children,
  className = "",
  onClick,
  onKeyDown,
  tabIndex,
}) {
  return (
    <tr
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      className={classNames(
        "border-b border-line last:border-none transition-colors hover:bg-canvas",
        onClick
          ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          : "",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={classNames("px-3 py-4 text-sm text-ink", className)}>
      {children}
    </td>
  );
}
