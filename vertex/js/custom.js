document.addEventListener("DOMContentLoaded", () => {
  const mediaType = document.getElementById("mediaType");
  const mediaTypeHint = document.getElementById("mediaTypeHint");

  const mediaInputMode = document.getElementById("mediaInputMode");
  const mediaInputHint = document.getElementById("mediaInputHint");

  function setHint(el, text) {
    if (!text) {
      el.textContent = "";
      el.style.display = "none";
      return;
    }
    el.textContent = text;
    el.style.display = "block";
  }

  function updateMediaTypeHint() {
    const val = mediaType.value;

    if (val === "carousel") {
      setHint(mediaTypeHint, "Instagram carousel supports up to 10 images.");
      return;
    }

    if (val === "image") {
      setHint(
        mediaTypeHint,
        "Image must be Instagram-compatible (JPG/PNG, 4:5–1.91:1 aspect ratio, and within size limits). Otherwise, it may not be publishable on Instagram."
      );
      return;
    }

    if (val === "video") {
      setHint(
        mediaTypeHint,
        "Check the video file size and duration. Video uploads to Instagram can take longer than images (especially on slower networks)."
      );
      return;
    }

    // none
    setHint(mediaTypeHint, "");
  }

  function updateMediaInputHint() {
    const val = mediaInputMode.value;

    if (val === "url") {
      setHint(
        mediaInputHint,
        "For social publishing, media URL must be publicly accessible."
      );
      return;
    }

    // file/upload
    setHint(mediaInputHint, "");
  }

  updateMediaTypeHint();
  updateMediaInputHint();

  mediaType.addEventListener("change", updateMediaTypeHint);
  mediaInputMode.addEventListener("change", updateMediaInputHint);
});
