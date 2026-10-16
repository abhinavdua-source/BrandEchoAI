import { useState } from "react";
import { ISSUE_LABELS, type CheckIssue } from "@/lib/voice";
import { Button } from "./ui";

type Segment = { text: string; issue?: number };

/** Split the draft into plain text and flagged quotes (matched in reading order). */
export function segmentDraft(
  draft: string,
  issues: CheckIssue[],
): { segments: Segment[]; unmatched: number[] } {
  const hits: { start: number; end: number; issue: number }[] = [];
  const unmatched: number[] = [];
  let cursor = 0;
  issues.forEach((iss, i) => {
    const q = iss.quote.trim();
    if (!q) {
      unmatched.push(i);
      return;
    }
    let at = draft.indexOf(q, cursor);
    if (at < 0) at = draft.toLowerCase().indexOf(q.toLowerCase(), cursor);
    if (at < 0) at = draft.toLowerCase().indexOf(q.toLowerCase());
    const overlaps = hits.some((h) => at < h.end && at + q.length > h.start);
    if (at < 0 || overlaps) {
      unmatched.push(i);
      return;
    }
    hits.push({ start: at, end: at + q.length, issue: i });
    cursor = at + q.length;
  });
  hits.sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let pos = 0;
  for (const h of hits) {
    if (h.start > pos) segments.push({ text: draft.slice(pos, h.start) });
    segments.push({ text: draft.slice(h.start, h.end), issue: h.issue });
    pos = h.end;
  }
  if (pos < draft.length) segments.push({ text: draft.slice(pos) });
  return { segments, unmatched };
}

export function ScorePanel({
  score,
  standard,
  verdict,
}: {
  score: number;
  standard: number;
  verdict: string;
}) {
  const pass = score >= standard;
  return (
    <div className="flex items-center gap-[18px] rounded-panel bg-panel px-4 py-3.5">
      <div className="flex items-baseline gap-0.5 font-serif">
        <span
          className={`text-[44px] leading-none font-medium ${pass ? "text-green-text" : "text-red"}`}
        >
          {score}
        </span>
        <span className="text-[16px] text-secondary">/100</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div
          role="img"
          aria-label={`Score ${score} of 100; house standard is ${standard}`}
          className="relative h-1.5 rounded-[3px] bg-rule"
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-[3px] ${pass ? "bg-green" : "bg-red"}`}
            style={{ width: `${score}%` }}
          />
          <div className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: `${standard}%` }} />
        </div>
        <span className="text-[14px] leading-[1.45] text-note">{verdict}</span>
      </div>
    </div>
  );
}

export function CheckResultView({
  draft,
  issues,
  rewrite,
  score,
  standard,
  verdict,
  onRecheck,
}: {
  draft: string;
  issues: CheckIssue[];
  rewrite: string;
  score: number;
  standard: number;
  verdict: string;
  onRecheck?: (text: string) => void;
}) {
  const [view, setView] = useState<"draft" | "final">("draft");
  const [copied, setCopied] = useState(false);
  const { segments } = segmentDraft(draft, issues);
  const isDraft = view === "draft";

  async function copy() {
    await navigator.clipboard.writeText(rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tab = (active: boolean) =>
    `rounded-seg px-3 py-1.5 text-[13px] font-medium transition-colors ${
      active ? "bg-surface text-ink shadow-seg" : "text-secondary"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <ScorePanel score={score} standard={standard} verdict={verdict} />

      <figure className="m-0 overflow-hidden rounded-card border border-[var(--rule-card)] bg-surface shadow-card">
        <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-rule-soft px-4 py-3">
          <span className="font-mono text-[12px] text-secondary">
            {issues.length} {issues.length === 1 ? "issue" : "issues"} · {draft.length} chars
          </span>
          <div role="group" aria-label="View" className="flex gap-0.5 rounded-btn bg-seg p-[3px]">
            <button
              type="button"
              aria-pressed={isDraft}
              onClick={() => setView("draft")}
              className={tab(isDraft)}
            >
              Marked-up draft
            </button>
            <button
              type="button"
              aria-pressed={!isDraft}
              onClick={() => setView("final")}
              className={tab(!isDraft)}
            >
              Rewrite
            </button>
          </div>
        </figcaption>

        {isDraft ? (
          <div className="flex flex-col gap-5 px-[22px] pt-6 pb-[22px]">
            <p className="font-serif text-[clamp(19px,1.8vw,22px)] leading-[1.6] whitespace-pre-wrap">
              {segments.map((s, i) =>
                s.issue === undefined ? (
                  <span key={i}>{s.text}</span>
                ) : (
                  <span key={i}>
                    <del className="mark-cut">
                      <span className="sr-only">Flagged: </span>
                      {s.text}
                    </del>
                    <sup className="font-mono text-[11px] font-medium text-red">{s.issue + 1}</sup>
                  </span>
                ),
              )}
            </p>
            {issues.length > 0 ? (
              <ol className="m-0 flex list-none flex-col gap-3 border-t border-dashed border-rule-dash p-0 pt-4 text-[15px] leading-[1.5] text-note">
                {issues.map((iss, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="pt-0.5 font-mono text-[12px] font-medium text-red">
                      {i + 1}
                    </span>
                    <span>
                      <strong className="font-semibold text-ink">
                        {ISSUE_LABELS[iss.category] ?? "Note"}.
                      </strong>{" "}
                      {iss.note}
                      {iss.suggestion && (
                        <span className="block pt-1 text-secondary">
                          Try: <span className="mark-fix text-ink">{iss.suggestion}</span>
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="border-t border-dashed border-rule-dash pt-4 text-[15px] text-green-text">
                No off-brand phrases found.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-[22px] pt-6 pb-[22px]">
            <p className="font-serif text-[clamp(19px,1.8vw,22px)] leading-[1.6] whitespace-pre-wrap">
              {rewrite}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-rule-dash pt-4">
              <span className="font-mono text-[12px] font-medium text-green-text">
                {issues.length ? `${issues.length} edits applied` : "Polished in your voice"}
              </span>
              <div className="flex gap-2">
                {onRecheck && (
                  <Button variant="outline" onClick={() => onRecheck(rewrite)}>
                    Edit &amp; recheck
                  </Button>
                )}
                <Button onClick={copy}>{copied ? "Copied" : "Copy rewrite"}</Button>
              </div>
            </div>
          </div>
        )}
      </figure>
    </div>
  );
}
