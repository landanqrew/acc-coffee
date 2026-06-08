"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-900 print:hidden"
    >
      Print
    </button>
  );
}
