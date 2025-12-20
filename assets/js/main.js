// SEARCH FUNCTION (home page only)
function searchTools() {
  const inputEl = document.getElementById("search-input");
  if (!inputEl) return;

  const input = inputEl.value.toLowerCase();
  const cards = document.getElementsByClassName("card");

  for (let i = 0; i < cards.length; i++) {
    const text = cards[i].innerText.toLowerCase();
    cards[i].style.display = text.includes(input) ? "block" : "none";
  }
}

/* ---------------------------------------
   NAVBAR DROPDOWN – after navbar loads
--------------------------------------- */

function initNavbarDropdowns() {
  const dropBtn = document.querySelector(".drop-btn");
  const mainMenu = document.querySelector(".dropdown-menu");
  const submenuItems = document.querySelectorAll(".submenu-item");
  const submenus = document.querySelectorAll(".submenu-panel");
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  let mainOpen = false;

  if (!dropBtn || !mainMenu || !hamburger || !navMenu) return;

  // MAIN MENU
  dropBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mainOpen = !mainOpen;

    mainMenu.classList.toggle("show", mainOpen);

    submenus.forEach((s) => s.classList.remove("show"));
  });

  // CATEGORY SUBMENU
  submenuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = item.dataset.submenu;

      submenus.forEach((panel) => {
        panel.classList.toggle(
          "show",
          panel.id === targetId && !panel.classList.contains("show")
        );
      });
    });
  });

  // CLICK OUTSIDE
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      mainMenu.classList.remove("show");
      submenus.forEach((s) => s.classList.remove("show"));
      mainOpen = false;
    }
  });

  // MOBILE MENU
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("show");
    hamburger.classList.toggle("open");

    if (!navMenu.classList.contains("show")) {
      mainMenu.classList.remove("show");
      submenus.forEach((s) => s.classList.remove("show"));
      mainOpen = false;
    }
  });
}

/* ---------------------------------------
   SCROLL TO TOP BUTTON
--------------------------------------- */

const scrollTopBtn = document.getElementById("scrollTopBtn");

if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add("show");
      scrollTopBtn.classList.remove("hide");
    } else {
      scrollTopBtn.classList.add("hide");
      scrollTopBtn.classList.remove("show");
    }
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ---------------------------------------
   REVEAL-ON-SCROLL ANIMATIONS
--------------------------------------- */

(function setupScrollReveal() {
  const revealEls = document.querySelectorAll(
    ".reveal-on-scroll, .page-reveal"
  );

  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealEls.forEach((el) => {
    observer.observe(el);
  });
})();

/* backup reveal */
setTimeout(() => {
  const unrevealed = document.querySelectorAll(
    ".reveal-on-scroll:not(.visible), .page-reveal:not(.visible)"
  );
  unrevealed.forEach((el) => el.classList.add("visible"));
}, 1200);

window.addEventListener("scroll", () => {
  const revealEls = document.querySelectorAll(
    ".reveal-on-scroll:not(.visible), .page-reveal:not(.visible)"
  );

  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add("visible");
    }
  });
});

document.addEventListener("touchstart", (e) => {
  const card = e.target.closest(".card");
  if (card) {
    card.classList.add("tap-active");
    setTimeout(() => card.classList.remove("tap-active"), 200);
  }
});

/* ---------------------------------------
   LOAD HEAD + NAVBAR + FOOTER
--------------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  // HEAD (analytics + favicon)
  try {
    const headReq = await fetch("/components/head-common.html");
    document
      .getElementById("global-head")
      .insertAdjacentHTML("afterbegin", await headReq.text());
  } catch (err) {
    console.error("Head load failed", err);
  }

  // STATIC NAVBAR inserted immediately
  const navContainer = document.getElementById("global-navbar");
  if (navContainer) {
    navContainer.innerHTML = `
    <nav class="nav-elevate">
    <a href="/index.html" class="logo">ToolifySuite</a>
  
    <!-- HAMBURGER (MOBILE) -->
    <div class="hamburger" id="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </div>
  
    <!-- MAIN NAV MENU -->
    <ul id="nav-menu">
      <li><a href="/index.html">Home</a></li>
  
      <li><a href="/blogs/blogs.html">Blogs</a></li>
  
      <!-- TOOLS DROPDOWN -->
      <li class="dropdown">
        <span class="drop-btn">Tools</span>
  
        <!-- FIRST + SECOND LEVEL MENUS (GROUPED) -->
        <div class="dropdown-menu">
          <!-- Text tools -->
          <div class="submenu-group">
            <div class="submenu-item" data-submenu="text-tools">Text Tools ▸</div>
            <div class="submenu-panel" id="text-tools">
              <a href="/tools/word-counter.html">Word Counter</a>
              <a href="/tools/ai-text-cleaner.html">AI Text Cleaner</a>
            </div>
          </div>
  
          <!-- Image tools -->
          <div class="submenu-group">
            <div class="submenu-item" data-submenu="image-tools">
              Image Tools ▸
            </div>
            <div class="submenu-panel" id="image-tools">
              <a href="/tools/image-compressor.html">Image Compressor</a>
            </div>
          </div>
  
          <!-- Generator tools -->
          <div class="submenu-group">
            <div class="submenu-item" data-submenu="generator-tools">
              Generator Tools ▸
            </div>
            <div class="submenu-panel" id="generator-tools">
              <a href="/tools/password-generator.html">Password Generator</a>
            </div>
          </div>
  
      <li><a href="/about.html">About</a></li>
      <li><a href="/contact.html">Contact</a></li>
      <li><a href="/privacy-policy.html">Privacy Policy</a></li>
      <li><a href="/terms-of-service.html">Terms of Service</a></li>
    </ul>
  </nav>  
    `;
    initNavbarDropdowns();
  }

  // FOOTER
  try {
    const ftReq = await fetch("/components/footer.html");
    document.getElementById("global-footer").innerHTML = await ftReq.text();
  } catch (err) {
    console.error("Footer load failed", err);
  }
});
