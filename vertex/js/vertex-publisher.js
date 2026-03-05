const API_BASE = "https://localhost:7221";
const PORTFOLIO_DETAIL_BASE =
  "https://avazgaraev.github.io/Personal-portfolio/blog-detail.html?id=";

const MAX_IG_CAROUSEL_IMAGES = 10;

const form = document.getElementById("vertexPostForm");
const publishToSocialEl = document.getElementById("publishToSocial");
const titleEl = document.getElementById("postTitle");
const descEl = document.getElementById("postDescription");
const mediaTypeEl = document.getElementById("mediaType");
const inputModeEl = document.getElementById("mediaInputMode");

const mediaUrlBlock = document.getElementById("mediaUrlBlock");
const mediaFileBlock = document.getElementById("mediaFileBlock");

const mediaUrlLabel = document.getElementById("mediaUrlLabel");
const mediaUrlEl = document.getElementById("mediaUrl");
const mediaUrlsExtra = document.getElementById("mediaUrlsExtra");
const addMoreUrlsBtn = document.getElementById("addMoreUrlsBtn");

const mediaFilesEl = document.getElementById("mediaFiles");
const fileHintEl = document.getElementById("fileHint");
const mediaFileLabel = document.getElementById("mediaFileLabel");

const submitBtn = document.getElementById("submitBtn");

const resultBox = document.getElementById("resultBox");
const resultTitle = document.getElementById("resultTitle");
const portfolioLinkEl = document.getElementById("portfolioLink");
const igLinkEl = document.getElementById("igLink");
const fbLinkEl = document.getElementById("fbLink");

const loadingArea = document.getElementById("loadingArea");
const loadingText = document.getElementById("loadingText");
const progressText = document.getElementById("progressText");

// -------- helpers --------
function resetExtraUrls() {
  mediaUrlsExtra.innerHTML = "";
}

function addExtraUrlInput() {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control mt-2";
  input.placeholder = "https://...";
  input.setAttribute("data-extra-url", "1");
  mediaUrlsExtra.appendChild(input);
}

function getAllUrlInputs() {
  const extras = Array.from(mediaUrlsExtra.querySelectorAll("input[data-extra-url='1']"));
  return [mediaUrlEl, ...extras];
}

function normalizeUrls(urls) {
  return urls.map(u => String(u || "").trim()).filter(Boolean);
}

function setLink(el, url, labelWhenAvailable, labelWhenMissing) {
  url = (url || "").trim();
  if (url) {
    el.href = url;
    el.textContent = labelWhenAvailable;
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  } else {
    el.href = "#";
    el.textContent = labelWhenMissing;
    el.style.pointerEvents = "none";
    el.style.opacity = "0.7";
  }
}

function showLoadingUI(message) {
  resultBox.style.display = "block";

  // Hide link rows until we finish
  portfolioLinkEl.parentElement.style.display = "none";
  igLinkEl.parentElement.style.display = "none";
  fbLinkEl.parentElement.style.display = "none";

  resultTitle.textContent = "Publishing...";
  loadingText.textContent = message || "Publishing";
  progressText.textContent = "";
  loadingArea.style.display = "block";
}

function showLinksUI(post) {
  loadingArea.style.display = "none";
  resultTitle.textContent = "Published Links";

  // Show rows
  portfolioLinkEl.parentElement.style.display = "flex";
  igLinkEl.parentElement.style.display = "flex";
  fbLinkEl.parentElement.style.display = "flex";

  // Portfolio link must be GitHub (as you requested)
  const portfolioUrl = PORTFOLIO_DETAIL_BASE + post.id;
  portfolioLinkEl.href = portfolioUrl;
  portfolioLinkEl.textContent = "Blog Link";

  setLink(igLinkEl, post.instagramLink, "Instagram Link", "Not shared");
  setLink(fbLinkEl, post.facebookLink, "Facebook Link", "Not shared");
}

function validateSelection(mediaType, urls, files) {
  if (mediaType === "none") return;

  if (inputModeEl.value === "url") {
    if (mediaType === "carousel") {
      if (urls.length === 0) throw new Error("Please provide at least 1 image URL.");
      if (urls.length > MAX_IG_CAROUSEL_IMAGES)
        throw new Error(`Carousel supports up to ${MAX_IG_CAROUSEL_IMAGES} images.`);
    } else {
      if (!urls[0]) throw new Error("Please provide a media URL.");
    }
  } else {
    if (!files || files.length === 0) throw new Error("Please select file(s) to upload.");
    if (mediaType === "carousel" && files.length > MAX_IG_CAROUSEL_IMAGES)
      throw new Error(`Carousel supports up to ${MAX_IG_CAROUSEL_IMAGES} images.`);
  }
}

// -------- UI rules --------
function applyMediaRules() {
  const mediaType = mediaTypeEl.value;
  const mode = inputModeEl.value;

  if (mode === "url") {
    mediaUrlBlock.style.display = "";
    mediaFileBlock.style.display = "none";
  } else {
    mediaUrlBlock.style.display = "none";
    mediaFileBlock.style.display = "";
  }

  resetExtraUrls();
  mediaUrlEl.value = "";
  mediaFilesEl.value = "";

  if (mediaType === "none") {
    mediaUrlLabel.textContent = "Media URL (disabled)";
    mediaUrlEl.disabled = true;
    addMoreUrlsBtn.style.display = "none";

    mediaFileLabel.textContent = "Upload (disabled)";
    mediaFilesEl.disabled = true;
    fileHintEl.textContent = "No media will be attached.";
    return;
  }

  mediaUrlEl.disabled = false;
  mediaFilesEl.disabled = false;

  if (mediaType === "image") {
    mediaUrlLabel.textContent = "Image URL";
    addMoreUrlsBtn.style.display = "none";

    mediaFileLabel.textContent = "Upload Image";
    mediaFilesEl.multiple = false;
    mediaFilesEl.accept = "image/*";
    fileHintEl.textContent = "Upload a single image.";
  }

  if (mediaType === "video") {
    mediaUrlLabel.textContent = "Video URL (direct .mp4 recommended)";
    addMoreUrlsBtn.style.display = "none";

    mediaFileLabel.textContent = "Upload Video";
    mediaFilesEl.multiple = false;
    mediaFilesEl.accept = "video/*";
    fileHintEl.textContent = "Upload a single video. Publishing may take longer.";
  }

  if (mediaType === "carousel") {
    mediaUrlLabel.textContent = `Carousel Image URLs (max ${MAX_IG_CAROUSEL_IMAGES})`;
    addMoreUrlsBtn.style.display = "";

    mediaFileLabel.textContent = `Upload Carousel Images (max ${MAX_IG_CAROUSEL_IMAGES})`;
    mediaFilesEl.multiple = true;
    mediaFilesEl.accept = "image/*";
    fileHintEl.textContent = `Instagram supports up to ${MAX_IG_CAROUSEL_IMAGES} images in a carousel.`;
  }
}

mediaTypeEl.addEventListener("change", applyMediaRules);
inputModeEl.addEventListener("change", applyMediaRules);
addMoreUrlsBtn.addEventListener("click", addExtraUrlInput);

// -------- Upload with progress (XHR) --------
function uploadFilesToApiWithProgress(files, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));

    xhr.open("POST", `${API_BASE}/api/media/upload`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          if (!Array.isArray(json.urls) || json.urls.length === 0) {
            reject(new Error("Upload succeeded but API did not return URLs."));
            return;
          }
          resolve(json.urls);
        } else {
          reject(new Error(json.message || "Upload failed."));
        }
      } catch {
        reject(new Error("Upload failed (invalid server response)."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed (network error)."));
    xhr.send(fd);
  });
}

// -------- Submit --------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing...";

  try {
    const publishToSocial = !!publishToSocialEl.checked;
    const title = titleEl.value.trim();
    const description = descEl.value.trim();
    const mediaType = mediaTypeEl.value;

    if (!title) throw new Error("Title is required.");
    if (!description) throw new Error("Description is required.");

    // show loading area instead of empty UI
    showLoadingUI("Publishing");

    let mediaURL = "";
    let mediaUrls = [];

    if (mediaType !== "none") {
      if (inputModeEl.value === "url") {
        const urls = normalizeUrls(getAllUrlInputs().map(i => i.value));
        validateSelection(mediaType, urls, null);

        if (mediaType === "carousel") mediaUrls = urls;
        else mediaURL = urls[0] || "";
      } else {
        const files = Array.from(mediaFilesEl.files || []);
        validateSelection(mediaType, [], files);

        showLoadingUI("Uploading");
        const uploadedUrls = await uploadFilesToApiWithProgress(files, (pct) => {
          progressText.textContent = `Upload: ${pct}%`;
        });

        showLoadingUI("Publishing");
        if (mediaType === "carousel") mediaUrls = uploadedUrls;
        else mediaURL = uploadedUrls[0] || "";
      }
    }

    const payload = {
      title,
      description,
      mediaURL,
      mediaType: mediaType === "carousel" ? "image" : mediaType,
      mediaUrls: mediaUrls.length ? mediaUrls : null,
      publishToSocial
    };

    const res = await fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const post = await res.json().catch(() => null);
    if (!res.ok) throw new Error(post?.message || "Publish failed. Check API logs.");

    showLinksUI(post);
  } catch (err) {
    console.error(err);
    resultTitle.textContent = "Error";
    loadingArea.style.display = "none";

    // show message in loadingArea spot
    resultBox.style.display = "block";
    progressText.textContent = err?.message || "Something went wrong.";

    // hide link rows on error
    portfolioLinkEl.parentElement.style.display = "none";
    igLinkEl.parentElement.style.display = "none";
    fbLinkEl.parentElement.style.display = "none";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Publish";
  }
});

// init
applyMediaRules();
