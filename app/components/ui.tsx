// Small building blocks used on every page, so the screens look the same.
import type { ReactNode } from "react";

// The title at the top of a page. Buttons go in the children.
export function PageHeader({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {children && <div className="actions-row">{children}</div>}
    </div>
  );
}

// A number with a label above it.
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <strong className="big">{value}</strong>
    </div>
  );
}

// Shown when a list has nothing in it yet.
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

// "2026-10-21T13:40:00Z" becomes "2026-10-21 13:40 UTC".
export function when(iso: string) {
  return iso ? iso.slice(0, 16).replace("T", " ") + " UTC" : "";
}
