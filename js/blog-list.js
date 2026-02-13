const API_BASE = "https://localhost:7221";

// video placeholder cover
const VIDEO_COVER =
  "https://www.techsmith.com/wp-content/uploads/2018/01/video-file-formats.png";

document.addEventListener("DOMContentLoaded", loadPosts);

async function loadPosts() {
  const row = document.getElementById("blogPostsRow");
  row.innerHTML = `<div class="col-12">Loading...</div>`;

  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) throw new Error("API error: " + res.status);

    const posts = await res.json();

    if (!posts.length) {
      row.innerHTML = `<div class="col-12">No posts yet.</div>`;
      return;
    }

    row.innerHTML = posts.map(renderCard).join("");
  } catch (e) {
    console.error(e);
    row.innerHTML = `<div class="col-12">Failed to load posts.</div>`;
  }
}

function renderCard(p) {
  const detailHref = `blog-detail.html?id=${p.id}`;

  const mediaHtml = renderMediaPreview(p, detailHref);

  const linksHtml = renderLinks(p);

  return `
    <div class="col-12 col-md-6 col-lg-6 col-xl-4 mb-30">
      <article class="post-container">
        <div class="post-thumb">
          ${mediaHtml}
        </div>

        <div class="post-content">
          <div class="entry-header">
            <h3><a href="${detailHref}">${escapeHtml(p.title || "")}</a></h3>
          </div>

          <div class="entry-content open-sans-font">
            <p>${escapeHtml(shorten(p.description || "", 120))}</p>
          </div>

          ${linksHtml}
        </div>
      </article>
    </div>
  `;
}

function renderMediaPreview(p, detailHref) {
  const type = (p.mediaType || "").toLowerCase();
  const mediaUrls = Array.isArray(p.mediaUrls) ? p.mediaUrls.filter(Boolean) : [];

  // VIDEO -> placeholder cover
  if (type === "video") {
    return `
      <a href="${detailHref}" class="d-block position-relative overflow-hidden">
        <img src="${VIDEO_COVER}" class="img-fluid" alt="Video Post" />
        <span class="media-badge"><i class="fa fa-play"></i> Video</span>
      </a>
    `;
  }

  // CAROUSEL -> show only first image + carousel badge
  if (mediaUrls.length >= 2) {
    const cover = mediaUrls[0];
    return `
      <a href="${detailHref}" class="d-block position-relative overflow-hidden">
        <img src="${cover}" class="img-fluid" alt="Carousel Post" />
        <span class="media-badge"><i class="fa fa-clone"></i> Carousel</span>
      </a>
    `;
  }

  // SINGLE IMAGE
  if (p.mediaURL) {
    return `
      <a href="${detailHref}" class="d-block position-relative overflow-hidden">
        <img src="${p.mediaURL}" class="img-fluid" alt="Blog Post" />
      </a>
    `;
  }

  // NO MEDIA
  return `
    <a href="${detailHref}" class="d-block position-relative overflow-hidden">
      <div style="height:180px; background:#eee; display:flex; align-items:center; justify-content:center;">
        No Media
      </div>
    </a>
  `;
}

function renderLinks(p) {
  const ig = (p.instagramLink || "").trim();
  const fb = (p.facebookLink || "").trim();

  // heç biri yoxdursa -> heç göstərmə (istəsən göstərə bilərik)
  if (!ig && !fb) return "";

  const igHtml = ig
    ? `<a href="${ig}" target="_blank" rel="noopener">Instagram</a>`
    : `<span style="opacity:.6;">Instagram: Not shared</span>`;

  const fbHtml = fb
    ? `<a href="${fb}" target="_blank" rel="noopener">Facebook</a>`
    : `<span style="opacity:.6;">Facebook: Not shared</span>`;

  return `
    <div class="open-sans-font" style="margin-top:10px; display:flex; gap:12px; flex-wrap:wrap;">
      ${igHtml}
      ${fbHtml}
    </div>
  `;
}

function shorten(str, n) {
  str = String(str || "");
  return str.length > n ? str.slice(0, n) + "..." : str;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
