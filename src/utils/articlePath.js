export function articlePath(article) {
  const slug = article?.slug || article?.id;
  if (!slug) return "/blog";
  const topicSlug = article?.topic_slug;
  return topicSlug
    ? `/${encodeURIComponent(topicSlug)}/${encodeURIComponent(slug)}`
    : `/blog/${encodeURIComponent(slug)}`;
}
