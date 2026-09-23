import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function AuthorShare({ name }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`View ${name || "this author"} on BlogSphere`);
  const links = [
    { label: "Facebook", icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, className: "text-blue-600 hover:bg-blue-50" },
    { label: "LinkedIn", icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, className: "text-sky-700 hover:bg-sky-50" },
    { label: "X", icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, className: "text-slate-900 hover:bg-slate-100" },
    { label: "WhatsApp", icon: FaWhatsapp, href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, className: "text-green-700 hover:bg-green-50" },
  ];

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return <div className="flex items-center gap-2" aria-label="Share author profile">
    {links.map(({ label, icon: Icon, href, className }) => <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share author profile on ${label}`}
      title={`Share on ${label}`}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:-translate-y-0.5 ${className}`}
    ><Icon size={15} aria-hidden="true" /></a>)}
    <button
      type="button"
      onClick={copyUrl}
      aria-label={copied ? "Author profile URL copied" : "Copy author profile URL"}
      title={copied ? "Copied" : "Copy profile URL"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100"
    >{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}</button>
  </div>;
}
