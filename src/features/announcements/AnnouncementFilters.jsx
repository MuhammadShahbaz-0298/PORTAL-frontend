/* AnnouncementFilters: search announcements and show the visible result count.
 * The query is applied to the rows already loaded by the announcements model.
 */
import SearchInput from "../../components/ui/SearchInput";

export default function AnnouncementFilters({
  query,
  onQueryChange,
  visibleCount,
  totalCount,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="Search announcements"
        className="sm:max-w-sm"
      />
      <p className="text-sm text-muted">
        Showing {visibleCount} of {totalCount} announcements
      </p>
    </div>
  );
}
