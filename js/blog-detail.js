const API_BASE = "https://avaz-portfolio-api-hygqdef8bzgrc8h9.westeurope-01.azurewebsites.net";

document.addEventListener("DOMContentLoaded", initDetail)

async function initDetail(){
    var id = new URLSearchParams(window.location.search).get("id");
    if(!id){
        showError("Missing id in URL.")
        return
    }
    try{
        var res = await fetch(`${API_BASE}/api/posts/${id}`)
        if(res.status==404){
            showError("Post not found")
            return
        }
        if(!res.ok) throw new Error("API Error: " + res.status)
        const json = await res.json();
        renderPost(json);
    }
    catch(e){
        console.log(e)
        showError("Failed to load post. Check API is running and CORS is enabled.")
    }
}

function renderPost(p) {
  const title = p.title || "";

  const date = p.createdAt ? new Date(p.createdAt) : null;
  const shortdate = date ? date.toLocaleDateString() : "--";
  setText("postDate", shortdate);
  setText("postTitle", title);

  const dec = escapeHtml(p.description || "");
  const newDec = document.getElementById("postDescription");
  newDec.innerHTML =
    dec
      .split("\n")
      .filter((line) => line.trim().length)
      .map((line) => `<p>${line}</p>`)
      .join("") || "<p></p>";

  const mediaWrap = document.getElementById("postMediaWrap");
  mediaWrap.innerHTML = "";

  const type = (p.mediaType || "").toLowerCase();
  const mediaUrls = Array.isArray(p.mediaUrls) ? p.mediaUrls.filter(Boolean) : [];

  // 1) CAROUSEL - əvvəl bunu yoxla
  if (type === "carousel" || mediaUrls.length >= 2) {
    mediaWrap.innerHTML = buildCarouselHTML(mediaUrls);
    wireCarouselUX(mediaUrls);
  }

  // 2) VIDEO
  else if (type === "video" && p.mediaURL) {
    const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(p.mediaURL);

    mediaWrap.innerHTML = isDirectVideo
      ? `
        <video class="img-fluid" controls preload="metadata"
               style="max-height:520px; width:100%; background:#000;">
          <source src="${p.mediaURL}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      `
      : `
        <img src="https://www.techsmith.com/wp-content/uploads/2018/01/video-file-formats.png"
             class="img-fluid" alt="Video Post" />
      `;
  }

  // 3) SINGLE IMAGE
  else if (p.mediaURL) {
    mediaWrap.innerHTML = `
      <img src="${p.mediaURL}" class="img-fluid" alt="Blog image" />
    `;
  }

  setLink("instagramLink", p.instagramLink, "Not shared");
  setLink("facebookLink", p.facebookLink, "Not shared");
}


function setText(id, value){
    const el = document.getElementById(id);
    if(el)
        el.textContent = value ?? ""
}

function setLink(id, url, fallbackText){
    const el = document.getElementById(id)
    if(url && String(url.trim().length)>0){
        el.href = url;
        el.textContent = url;
        el.style.pointerEvents = "auto";
        el.style.opacity = "1";
    }
    else{
        el.href = "#"
        el.textContent = fallbackText
        el.style.pointerEvents = "none"
        el.style.opacity = "0.7"
    }
}

function showError(msg){
    setText("postTitle", msg);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildCarouselHTML(urls) {
  const id = "postCarousel";

  const slides = urls
    .map(
      (u, i) => `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <img src="${u}" alt="Image ${i + 1}" loading="lazy" data-full="${u}">
      </div>
    `
    )
    .join("");

  const thumbs = urls
    .map(
      (u, i) => `
      <div class="carousel-thumb ${i === 0 ? "active" : ""}" data-index="${i}">
        <img src="${u}" alt="Thumb ${i + 1}" loading="lazy">
      </div>
    `
    )
    .join("");

  return `
    <div class="detail-carousel">
      <div class="media-counter" id="mediaCounter">1/${urls.length}</div>

      <div id="${id}" class="carousel slide" data-bs-ride="false" data-bs-touch="true">
        <div class="carousel-inner">
          ${slides}
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>

        <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <div class="carousel-thumbs" id="carouselThumbs">
      ${thumbs}
    </div>
  `;
}

function wireCarouselUX(urls) {
  const carouselEl = document.getElementById("postCarousel");
  const thumbsEl = document.getElementById("carouselThumbs");
  const counterEl = document.getElementById("mediaCounter");

  if (!carouselEl || !thumbsEl || !counterEl) return;

  // Bootstrap Carousel instance
  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);

  function setActiveThumb(index) {
    thumbsEl.querySelectorAll(".carousel-thumb").forEach((t) => t.classList.remove("active"));
    const active = thumbsEl.querySelector(`.carousel-thumb[data-index="${index}"]`);
    if (active) {
      active.classList.add("active");
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
    counterEl.textContent = `${index + 1}/${urls.length}`;
  }

  // thumbnail click -> slide
  thumbsEl.addEventListener("click", (e) => {
    const thumb = e.target.closest(".carousel-thumb");
    if (!thumb) return;
    const idx = Number(thumb.dataset.index);
    if (!Number.isNaN(idx)) carousel.to(idx);
  });

  // slide event -> update thumb + counter
  carouselEl.addEventListener("slid.bs.carousel", () => {
    const activeIndex = [...carouselEl.querySelectorAll(".carousel-item")].findIndex((x) =>
      x.classList.contains("active")
    );
    if (activeIndex >= 0) setActiveThumb(activeIndex);
  });

  // click big image -> open lightbox (optional)
  carouselEl.addEventListener("click", (e) => {
    const img = e.target.closest("img");
    if (!img) return;

    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxEl = document.getElementById("imgLightbox");
    if (!lightboxImg || !lightboxEl) return; // modal yoxdursa, skip

    lightboxImg.src = img.dataset.full || img.src;
    bootstrap.Modal.getOrCreateInstance(lightboxEl).show();
  });

  setActiveThumb(0);
}
