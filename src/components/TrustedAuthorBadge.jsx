import { BadgeCheck } from "lucide-react";

export default function TrustedAuthorBadge({ isTrusted, size = 19 }) {
  if (!(isTrusted === true || Number(isTrusted) === 1)) return null;

  return (
    <span className="inline-flex shrink-0 items-center justify-center" role="img" aria-label="Verified author" title="Verified author">
      <BadgeCheck size={size} fill="#2563eb" className="text-white" aria-hidden="true" />
    </span>
  );
}
