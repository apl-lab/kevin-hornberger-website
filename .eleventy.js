module.exports = function (eleventyConfig) {
  // Only treat Markdown and Nunjucks as templates. All existing .html pages
  // are copied through untouched so the hand-built site is never reprocessed.
  eleventyConfig.setTemplateFormats(["md", "njk"]);

  // Enable raw HTML inside Markdown (the imported posts contain some).
  eleventyConfig.amendLibrary("md", (md) => md.set({ html: true }));

  // Pass the existing hand-built site pages straight into the build output.
  // (Explicit list so internal working docs are NOT published.)
  ["index.html", "meet-kevin.html", "issues.html", "district-35b.html",
   "privacy-policy.html", "terms-of-service.html", "404.html"].forEach(
    (f) => eleventyConfig.addPassthroughCopy(f)
  );
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  // Keep internal working documents out of the published site.
  eleventyConfig.ignores.add("news-catalog.md");
  eleventyConfig.ignores.add("news-archive-preview.html");

  // Friendly date for templates, e.g. "April 21, 2026"
  eleventyConfig.addFilter("dateDisplay", (value) => {
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    });
  });

  // First paragraph of a post body, as a plain-text excerpt.
  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const text = String(content).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text.length > 180 ? text.slice(0, 180).replace(/\s+\S*$/, "") + "…" : text;
  });

  return {
    dir: { input: ".", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
