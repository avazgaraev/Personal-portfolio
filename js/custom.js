(function($) {

	"use strict";

	/* ----------------------------------------------------------- */
	/*  FUNCTION TO STOP LOCAL AND YOUTUBE VIDEOS IN SLIDESHOW
    /* ----------------------------------------------------------- */

	function stop_videos() {
  // Stop local video (if exists)
  var video = document.getElementById("video");
  if (video && video.paused !== true && video.ended !== true) {
    video.pause();
  }

  // Stop YouTube iframe (if exists)
  var yt = document.querySelector(".youtube-video");
  if (yt && yt.contentWindow) {
    yt.contentWindow.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      "*"
    );
  }
}

	$(document).ready(function() {
function showHeader() {
  $("#navbar-collapse-toggle").removeClass("hide-header");
  $("#trigger-mobile").removeClass("hide-trigger");
}

// When slideshow is closed (class removed), restore header
var galleryEl = document.getElementById("grid-gallery");
if (galleryEl) {
  var obs = new MutationObserver(function () {
    if (!galleryEl.classList.contains("slideshow-open")) {
      showHeader();
    }
  });
  obs.observe(galleryEl, { attributes: true, attributeFilter: ["class"] });
}

		/* ----------------------------------------------------------- */
		/*  STOP VIDEOS
        /* ----------------------------------------------------------- */

		$('.slideshow nav span').on('click', function () {
			stop_videos();
		});

		/* ----------------------------------------------------------- */
		/*  MOBILE MENU
		/* ----------------------------------------------------------- */

		$('#mobile-nav li').on('click', function () {
			$('#mobile-nav li').removeClass('active');
			$(this).addClass('active');
			$('#desktop-nav li').removeClass('active');
			var index = $(this).index() + 1;
			$('#desktop-nav li:nth-child(' + index + ')').addClass('active');
		});
		
		$('#trigger-mobile').on('click', function () {
			$(this).toggleClass('show-menu');
			$('#mobile-nav').toggleClass('hide-list');
		});

		/* ----------------------------------------------------------- */
		/*  DESKTPOP MENU
        /* ----------------------------------------------------------- */

		$('#desktop-nav li').on('click', function () {
			$('#desktop-nav li').removeClass('active');
			$(this).addClass('active');
			$('#mobile-nav li').removeClass('active');
			var index = $(this).index() + 1;
			$('#mobile-nav li:nth-child(' + index + ')').addClass('active');
		});

		/* ----------------------------------------------------------- */
		/*  PORTFOLIO GALLERY
        /* ----------------------------------------------------------- */

		if ($('.gridlist').length) {
			new CBPGridGallery( document.getElementById( 'grid-gallery' ) );
		}

		/* ----------------------------------------------------------- */
		/*  HIDE HEADER WHEN PORTFOLIO SLIDESHOW OPENED
        /* ----------------------------------------------------------- */

		$(".gridlist figure").on('click', function() {
			$("#navbar-collapse-toggle").addClass('hide-header');
			if ($(window).width() < 992) {
				$('#trigger-mobile').addClass('hide-trigger');
			}
		});

		/* ----------------------------------------------------------- */
		/*  SHOW HEADER WHEN PORTFOLIO SLIDESHOW CLOSED
        /* ----------------------------------------------------------- */

		$(".nav-close").on('click', function() {
			$("#navbar-collapse-toggle").removeClass('hide-header');
			$('#trigger-mobile').removeClass('hide-trigger');
		});
		$(".nav-prev").on('click', function() {
			if ($('.slideshow ul li:first-child').hasClass('current')) {
				$("#navbar-collapse-toggle").removeClass('hide-header');
				$('#trigger-mobile').removeClass('hide-trigger');
			}
		});
		$(".nav-next").on('click', function() {
			if ($('.slideshow ul li:last-child').hasClass('current')) {
				$("#navbar-collapse-toggle").removeClass('hide-header');
				$('#trigger-mobile').removeClass('hide-trigger');
			}
		});

		/* ----------------------------------------------------------- */
		/*  PORTFOLIO DIRECTION AWARE HOVER EFFECT
        /* ----------------------------------------------------------- */

		var item = $(".gridlist li figure");
		var elementsLength = item.length;
		for (var i = 0; i < elementsLength; i++) {
			if ($(window).width() > 991) {
				$(item[i]).hoverdir();
			}
		}

		/* ----------------------------------------------------------- */
		/*  AJAX CONTACT FORM
        /* ----------------------------------------------------------- */

		$("#contactform").on("submit", function() {
			$("#message").text("Sending...");
			var form = $(this);
			$.ajax({
				url: form.attr("action"),
				method: form.attr("method"),
				data: form.serialize(),
				success: function(result) {
					if (result === "success") {
						$("#contactform").find(".output_message").addClass("success");
						$("#message").text("Message Sent!");
					} else {
						$("#contactform").find(".output_message").addClass("error");
						$("#message").text("Error Sending!");
					}
				}
			});
			return false;
		});

	});

	$(document).keyup(function(e) {

		/* ----------------------------------------------------------- */
		/*  KEYBOARD NAVIGATION IN PORTFOLIO SLIDESHOW
        /* ----------------------------------------------------------- */
		if (e.keyCode === 27) {
			stop_videos();
			$('.nav-close').click();
			$("#navbar-collapse-toggle").removeClass('hide-header');
		}
		if ((e.keyCode === 37) || (e.keyCode === 39)) {
			stop_videos();
		}
	});


})(jQuery);
(function () {
  function showPage(id) {
    // 1) bütün page-lərdən current-u sil
    document.querySelectorAll(".page").forEach(p => p.classList.remove("page--current"));

    // 2) target page-i current et
    const page = document.getElementById(id);
    if (page) page.classList.add("page--current");

    // 3) desktop nav active class
    document.querySelectorAll("#desktop-nav .desktop-nav-element").forEach(li => li.classList.remove("active"));
    const desktopActive = document.querySelector(`#desktop-nav .desktop-nav-element[data-target="${id}"]`);
    if (desktopActive) desktopActive.classList.add("active");

    // 4) mobile nav active class
    document.querySelectorAll("#mobile-nav .mobile-nav-element").forEach(li => li.classList.remove("active"));
    const mobileActive = document.querySelector(`#mobile-nav .mobile-nav-element[data-target="${id}"]`);
    if (mobileActive) mobileActive.classList.add("active");
  }

  // Menyu klikləri: hash set et + page göstər
  document.addEventListener("click", function (e) {
    const item = e.target.closest("[data-target]");
    if (!item) return;

    const id = item.getAttribute("data-target");
    if (!id) return;

    // URL-ə yaz: refresh olanda saxlanacaq
    location.hash = id;

    // dərhal göstər
    showPage(id);
  });

  // Səhifə açılan kimi: hash varsa ora get
  window.addEventListener("load", function () {
    const id = (location.hash || "#home").replace("#", "");
    showPage(id);
  });

  // Back/forward düymələri üçün də işləsin
  window.addEventListener("hashchange", function () {
    const id = (location.hash || "#home").replace("#", "");
    showPage(id);
  });
})();

//preloade rand navigated page queue 
