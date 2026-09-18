import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import ArticleBookmark from "./ArticleBookmark";

export default function ArticleShare({ title, url, slug }) {
  const [message, setMessage] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const [instagram, setInstagram] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const buttonClass = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
  const platforms = [
    { name: "Facebook", icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: "text-blue-600 hover:bg-blue-50" },
    { name: "LinkedIn", icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: "text-sky-700 hover:bg-sky-50" },
    { name: "X", icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title || "")}`, color: "text-slate-900 hover:bg-slate-100" },
    { name: "WhatsApp", icon: FaWhatsapp, href: `https://wa.me/?text=${encodeURIComponent(`${title || ""}\n${url}`)}`, color: "text-green-700 hover:bg-green-50" },
  ];

  async function copyLink(forInstagram = false) {
    setInstagram(forInstagram);
    setManualCopy(false);
    try {
      await navigator.clipboard.writeText(url);
      setMessage(forInstagram
        ? "Link copied! Open Instagram and paste it into a message or a Story link sticker."
        : "Article link copied!");
    } catch {
      setManualCopy(true);
      setMessage(forInstagram
        ? "Copy the link below, then paste it into an Instagram message or a Story link sticker."
        : "Copy the article link below.");
    }
  }

  return (
    <section aria-label="Share article" className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
        <Share2 size={18} aria-hidden="true" />
        Share article
      </h2>
      <div className="flex flex-wrap items-start gap-4">
      <div className="flex flex-wrap gap-2">
        {platforms.slice(0, 2).map(({ name, icon: Icon, href, color }) => (
          <a key={name} href={href} target="_blank" rel="noopener noreferrer" title={`Share on ${name}`} aria-label={`Share on ${name} (opens in a new tab)`} className={`${buttonClass} ${color}`}>
            <Icon size={17} aria-hidden="true" />
          </a>
        ))}
        <button type="button" onClick={() => copyLink(true)} aria-label="Copy article link to share on Instagram" title="Copy article link to share on Instagram" className={`${buttonClass} text-pink-600 hover:bg-pink-50`}>
          <FaInstagram size={17} aria-hidden="true" />
        </button>
        {platforms.slice(2).map(({ name, icon: Icon, href, color }) => (
          <a key={name} href={href} target="_blank" rel="noopener noreferrer" title={`Share on ${name}`} aria-label={`Share on ${name} (opens in a new tab)`} className={`${buttonClass} ${color}`}>
            <Icon size={17} aria-hidden="true" />
          </a>
        ))}
        <button type="button" onClick={() => copyLink()} aria-label="Copy article link" title="Copy article link" className={`${buttonClass} text-slate-600 hover:bg-slate-50`}>
          <Copy size={17} aria-hidden="true" />
        </button>
      </div>
      {slug && <div className="ml-auto max-w-full"><ArticleBookmark key={slug} slug={slug} /></div>}
      </div>
      <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>
      {manualCopy && (
        <input aria-label="Article link to copy" readOnly value={url} onFocus={(event) => event.target.select()} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700" />
      )}
      {instagram && (
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block rounded text-sm font-semibold text-pink-600 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600">
          Open Instagram (new tab)
        </a>
      )}
    </section>
  );
}
