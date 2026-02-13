const API_BASE = "https://avaz-portfolio-api.azurewebsites.net";

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

function renderPost(p){
    
    // const websiteLink;
    const title = p.title || "";
    //Date
    const date = p.createdAt ? new Date(p.createdAt) : null;
    const shortdate = date ? date.toLocaleDateString() : "--"
    setText("postDate", shortdate)

    //Title
    setText("postTitle", title)

    //Description
    const dec = escapeHtml(p.description || "")
    const newDec = document.getElementById("postDescription")
    newDec.innerHTML = dec.split("\n").filter(line=>line.trim().length).map(line=>`<p>${line}</p>`).join("") || "<p></p>"

    //Media
      const mediaWrap = document.getElementById("postMediaWrap");
  mediaWrap.innerHTML = "";

  const type = (p.mediaType || "").toLowerCase();
  const mediaUrls = Array.isArray(p.mediaUrls) ? p.mediaUrls.filter(Boolean) : [];

  // VIDEO -> show placeholder image (or you can embed video)
  if (type === "video" && p.mediaURL) {
  // mp4 kimi görünürsə, video göstər
  const isDirectVideo =
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(p.mediaURL);

  if (isDirectVideo) {
    mediaWrap.innerHTML = `
      <video class="img-fluid" controls preload="metadata"
             style="max-height:520px; width:100%; background:#000;">
        <source src="${p.mediaURL}" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    `;
  } else {
    // direct video deyil -> placeholder göstər
    mediaWrap.innerHTML = `
      <img src="https://www.techsmith.com/wp-content/uploads/2018/01/video-file-formats.png"
           class="img-fluid" alt="Video Post" />
    `;
  }
}
  // SINGLE IMAGE
  else if (p.mediaURL) {
    mediaWrap.innerHTML = `
      <img src="${p.mediaURL}" class="img-fluid" alt="Blog image" />
    `;
  }
  else if(mediaUrls.length >= 2){
    const preview = mediaUrls.slice(0, 10);

    const gridItems = preview
      .map(
        (url) => `
        <div class="col-6 p-1">
          <img src="${url}" class="img-fluid" alt="Blog Post" style="width:100%; height:140px; object-fit:cover;" />
        </div>`
      )
      .join("");

    return `
      <a href="${detailHref}" class="d-block position-relative overflow-hidden">
        <div class="container-fluid p-0">
          <div class="row g-0">
            ${gridItems}
          </div>
        </div>
      </a>
    `;
  }

  
    setLink("instagramLink", p.instagramLink, "Not shared")
    setLink("facebookLink", p.facebookLink, "Not shared")
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