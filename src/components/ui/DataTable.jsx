/* DataTable: responsive table rendering with a single empty-state contract. */
import { Table } from 'reactstrap';
import AsyncState from './AsyncState';
export default function DataTable({ columns, rows = [], renderRow, loading = false, error = '', empty, onRetry }) { return <AsyncState loading={loading} error={error} empty={rows.length ? false : (empty || true)} onRetry={onRetry}>{rows.length > 0 && <Table responsive className="editorial-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map(renderRow)}</tbody></Table>}</AsyncState>; }
