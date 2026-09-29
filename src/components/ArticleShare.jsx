import { useEffect, useState } from "react";
import { Check, Copy, Flag, Share2, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ArticleBookmark from "./ArticleBookmark";

export default function ArticleShare({ title, url, slug, onReact, reaction, reactionCounts, reactionLoading, reportOpen, setReportOpen, reportReason, setReportReason, reportDetails, setReportDetails, reportSubmitting, reportError, submitReport }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const platforms = [
    { name: "Facebook", icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, style: "text-[#1877F2] bg-blue-50 hover:bg-blue-100" },
    { name: "X", icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title || "")}`, style: "text-slate-900 bg-slate-100 hover:bg-slate-200" },
    { name: "LinkedIn", icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, style: "text-[#0A66C2] bg-sky-50 hover:bg-sky-100" },
    { name: "WhatsApp", icon: FaWhatsapp, href: `https://wa.me/?text=${encodeURIComponent(`${title || ""}\n${shareUrl}`)}`, style: "text-[#128C7E] bg-emerald-50 hover:bg-emerald-100" },
  ];

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") { setOpen(false); setReportOpen?.(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setReportOpen]);

  async function copyLink() {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <section aria-label="Article actions" className="flex flex-wrap items-center gap-2">
      {onReact && <div className="flex items-center gap-2" aria-label="Article reactions">
        <button type="button" onClick={() => onReact("like")} disabled={reactionLoading} aria-pressed={reaction === "like"} aria-label={`Like article, ${reactionCounts?.likes_count || 0} likes`} title="Like"
          className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${reaction === "like" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"}`}>
          <ThumbsUp size={16} aria-hidden="true" /><span>{reactionCounts?.likes_count || 0}</span>
        </button>
        <button type="button" onClick={() => onReact("dislike")} disabled={reactionLoading} aria-pressed={reaction === "dislike"} aria-label={`Dislike article, ${reactionCounts?.dislikes_count || 0} dislikes`} title="Dislike"
          className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${reaction === "dislike" ? "border-rose-600 bg-rose-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"}`}>
          <ThumbsDown size={16} aria-hidden="true" /><span>{reactionCounts?.dislikes_count || 0}</span>
        </button>
      </div>}
      <button type="button" onClick={() => setOpen(true)} aria-label="Share article" title="Share article" aria-haspopup="dialog" aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        <Share2 size={17} aria-hidden="true" />
      </button>
      {(slug || setReportOpen) && <div className="ml-auto flex items-center gap-2">
        {slug && <ArticleBookmark key={slug} slug={slug} />}
        {setReportOpen && <button type="button" onClick={() => setReportOpen(true)} aria-label="Report article" title="Report article" aria-haspopup="dialog" aria-expanded={reportOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
          <Flag size={17} aria-hidden="true" />
        </button>}
      </div>}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="article-share-title" aria-describedby="article-share-description"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Share2 size={18} aria-hidden="true" /></span>
                <h2 id="article-share-title" className="text-lg font-bold tracking-tight text-slate-900">Share this story</h2>
                <p id="article-share-description" className="mt-1 text-sm text-slate-500">Pass a good read along to someone.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close share dialog" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"><X size={19} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-5">
              {platforms.map(({ name, icon: Icon, href, style }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${style}`}><Icon size={18} aria-hidden="true" /></span>
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                </a>
              ))}
              <button type="button" onClick={async () => { await copyLink(); }} className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${copied ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>{copied ? <Check size={18} /> : <Copy size={18} />}</span>
                <span className="text-sm font-semibold text-slate-700">{copied ? "Copied!" : "Copy link"}</span>
              </button>
              <button type="button" onClick={async () => { await copyLink(); window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer"); }} className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600"><FaInstagram size={18} aria-hidden="true" /></span>
                <span className="text-sm font-semibold text-slate-700">Instagram</span>
              </button>
            </div>

            <div className="mx-6 mb-6 rounded-xl bg-slate-50 px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                <span className="shrink-0 font-semibold uppercase tracking-wide text-slate-400">Link</span>
                <span className="truncate">{shareUrl}</span>
              </div>
              {copyError && <p role="status" className="mt-2 text-xs text-rose-600">Clipboard access is unavailable. Select and copy the link above.</p>}
              {copied && <p role="status" className="mt-2 text-xs font-medium text-emerald-700">Link copied to clipboard.</p>}
            </div>
          </div>
        </div>
      )}
      {reportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportOpen(false); }}>
          <form onSubmit={submitReport} role="dialog" aria-modal="true" aria-labelledby="article-report-title" className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Flag size={17} aria-hidden="true" /></span>
                <h2 id="article-report-title" className="text-lg font-bold tracking-tight text-slate-900">Report this article</h2>
                <p className="mt-1 text-sm text-slate-500">Choose the reason that best describes the issue.</p>
              </div>
              <button type="button" onClick={() => setReportOpen(false)} aria-label="Close report dialog" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"><X size={19} aria-hidden="true" /></button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="article-report-reason" className="mb-2 block text-sm font-semibold text-slate-700">Reason</label>
                <select id="article-report-reason" value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100">
                  <option value="copied_content">Copied content</option>
                  <option value="spam">Spam</option>
                  <option value="misleading">Misleading information</option>
                </select>
              </div>
              <div>
                <label htmlFor="article-report-details" className="mb-2 block text-sm font-semibold text-slate-700">Additional details <span className="font-normal text-slate-500">(optional)</span></label>
                <textarea id="article-report-details" maxLength={2000} rows={4} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Share any context that could help us review this report." className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100" />
                <p className="mt-1 text-right text-xs text-slate-400">{reportDetails.length}/2000</p>
              </div>
              {reportError && <p role="alert" className="text-sm text-rose-700">{reportError}</p>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <p className="text-xs text-slate-500">Reports are reviewed by the site team.</p>
              <button type="submit" disabled={reportSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60">
                <Flag size={15} aria-hidden="true" /> {reportSubmitting ? "Sending..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
