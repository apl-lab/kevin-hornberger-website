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

  // Turn standalone YouTube/Vimeo links in News posts into responsive inline players.
  // Covers both imported posts ("Watch the video: <url>") and future posts where
  // an editor pastes a bare video link on its own line. Contextual links inside
  // sentences are left untouched.
  function videoEmbedSrc(rawUrl) {
    const u = rawUrl.replace(/&amp;/g, "&");
    let m;
    if ((m = u.match(/(?:youtube\.com\/(?:embed\/|watch\?(?:[^"]*&)?v=)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)))
      return "https://www.youtube.com/embed/" + m[1];
    if ((m = u.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/i)))
      return "https://player.vimeo.com/video/" + m[1];
    return null;
  }
  function videoMarkup(src) {
    return '<div class="video-embed"><iframe src="' + src +
      '" loading="lazy" title="Embedded video" frameborder="0"' +
      ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
      ' allowfullscreen></iframe></div>';
  }
  eleventyConfig.addTransform("embedVideos", function (content) {
    const out = this.page && this.page.outputPath;
    if (!out || !out.includes("/news/") || !out.endsWith(".html")) return content;
    // (A) Imported "Watch the video:" / "View embedded content" paragraphs.
    content = content.replace(
      /<p>\s*<strong>[^<]*?(?:Watch the video|View embedded content)[^<]*?<\/strong>\s*<a href="([^"]+)"[^>]*>.*?<\/a>\s*<\/p>/gi,
      (full, href) => { const src = videoEmbedSrc(href); return src ? videoMarkup(src) : full; }
    );
    // (B) A bare auto-link alone in a paragraph (link text equals the URL).
    content = content.replace(
      /<p>\s*<a href="([^"]+)">([^<]+)<\/a>\s*<\/p>/gi,
      (full, href, text) => {
        if (href.replace(/&amp;/g, "&") !== text.replace(/&amp;/g, "&")) return full;
        const src = videoEmbedSrc(href); return src ? videoMarkup(src) : full;
      }
    );
    return content;
  });

  return {
    dir: { input: ".", output: "_site", includes: "_includes" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
