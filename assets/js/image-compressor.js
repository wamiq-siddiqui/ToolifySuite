(function () {
  // ------- DOM ELEMENTS -------
  const dropzone = document.getElementById("image-compressor-dropzone");
  const fileInput = document.getElementById("image-compressor-file-input");
  const errorEl = document.getElementById("image-compressor-error");
  const listEl = document.getElementById("image-compressor-list");

  const qualityRange = document.getElementById("image-compressor-quality");
  const qualityValue = document.getElementById(
    "image-compressor-quality-value"
  );
  const qualityPresetBtns = document.querySelectorAll(
    ".image-compressor-quality-presets .image-compressor-btn"
  );

  const formatSelect = document.getElementById("image-compressor-format");

  const resizeEnable = document.getElementById(
    "image-compressor-resize-enable"
  );
  const widthInput = document.getElementById("image-compressor-width");
  const heightInput = document.getElementById("image-compressor-height");
  const keepRatio = document.getElementById("image-compressor-keep-ratio");

  const stripMetadata = document.getElementById(
    "image-compressor-strip-metadata"
  );

  const compressAllBtn = document.getElementById(
    "image-compressor-compress-all-btn"
  );
  const clearAllBtn = document.getElementById("image-compressor-clear-all-btn");
  const downloadAllBtn = document.getElementById(
    "image-compressor-download-all-btn"
  );

  // presets
  const singlePresetsWrap = document.getElementById(
    "image-compressor-single-presets"
  );
  const bulkPresetsWrap = document.getElementById(
    "image-compressor-bulk-presets"
  );

  if (!dropzone || !fileInput || !listEl) return;

  // ------- STATE -------
  let items = [];
  let idCounter = 0;
  let lastDims = null; // last image dims for aspect ratio
  let activeSinglePreset = null; // 'original' | 'sd' | 'hd' | 'ultra' | null
  let activeBulkPreset = null;

  const MAX_SIZE = 15 * 1024 * 1024; // 15 MB
  const MAX_FILES = 20;

  // ------- HELPERS -------
  function setError(msg) {
    if (errorEl) errorEl.textContent = msg || "";
  }

  function updateButtonsState() {
    const hasItems = items.length > 0;
    if (compressAllBtn) compressAllBtn.disabled = !hasItems;
    if (clearAllBtn) clearAllBtn.disabled = !hasItems;

    const anyCompressed = items.some((it) => it.compressedBlob);
    if (downloadAllBtn) downloadAllBtn.disabled = !anyCompressed;

    updatePresetVisibility();
  }

  function updateResizeUI() {
    const enable = !!resizeEnable && resizeEnable.checked;
    widthInput.disabled = !enable;
    heightInput.disabled = !enable;
    keepRatio.disabled = !enable;
  }

  function humanSize(bytes) {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB"];
    const i = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes) / Math.log(1024))
    );
    const val = bytes / Math.pow(1024, i);
    return val.toFixed(i === 0 ? 0 : 2) + " " + units[i];
  }

  function formatPercent(n) {
    return n.toFixed(1).replace(/\.0$/, "") + "%";
  }

  function getOutputMime(originalType) {
    const choice = formatSelect.value;
    if (choice === "jpeg") return "image/jpeg";
    if (choice === "png") return "image/png";
    if (choice === "webp") return "image/webp";
    return originalType || "image/jpeg";
  }

  function readImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function drawToCanvas(img, w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas;
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create blob"));
        },
        mime,
        quality
      );
    });
  }

  // orientation helper
  function getOrientation(w, h) {
    const ratio = w / h;
    if (Math.abs(ratio - 1) < 0.1) return "square";
    return w > h ? "landscape" : "portrait";
  }

  // preset sizing (orientation-aware)
  function computePresetSize(preset, originalW, originalH) {
    const orientation = getOrientation(originalW, originalH);

    let targetMain = null; // width for landscape, height for portrait/square
    if (preset === "sd") {
      if (orientation === "landscape") targetMain = 1280;
      else targetMain = 720;
    } else if (preset === "hd") {
      if (orientation === "landscape") targetMain = 1920;
      else targetMain = 1080;
    } else if (preset === "ultra") {
      if (orientation === "landscape") targetMain = 2560;
      else targetMain = 1440;
    } else {
      // original
      return { width: originalW, height: originalH };
    }

    // don't upscale
    if (
      (orientation === "landscape" && originalW <= targetMain) ||
      (orientation !== "landscape" && originalH <= targetMain)
    ) {
      return { width: originalW, height: originalH };
    }

    let scale;
    if (orientation === "landscape") {
      scale = targetMain / originalW;
    } else {
      scale = targetMain / originalH;
    }

    return {
      width: Math.round(originalW * scale),
      height: Math.round(originalH * scale),
    };
  }

  // main target size logic
  function computeTargetSize(originalW, originalH, context) {
    // context: 'single' | 'batch'
    const useSingle = context === "single";
    const preset = useSingle ? activeSinglePreset : activeBulkPreset;

    if (preset) {
      return computePresetSize(preset, originalW, originalH);
    }

    if (!resizeEnable.checked) {
      return { width: originalW, height: originalH };
    }

    const w = parseInt(widthInput.value, 10);
    const h = parseInt(heightInput.value, 10);

    if (!w && !h) {
      return { width: originalW, height: originalH };
    }

    if (keepRatio.checked) {
      if (w && !h) {
        const scale = w / originalW;
        return {
          width: w,
          height: Math.round(originalH * scale),
        };
      }
      if (!w && h) {
        const scale = h / originalH;
        return {
          width: Math.round(originalW * scale),
          height: h,
        };
      }
      if (w && h) {
        const scale = Math.min(w / originalW, h / originalH);
        return {
          width: Math.round(originalW * scale),
          height: Math.round(originalH * scale),
        };
      }
    }

    return {
      width: w || originalW,
      height: h || originalH,
    };
  }

  // ------- PRESET UI -------
  function clearPresetActive(group) {
    if (group === "single" && singlePresetsWrap) {
      singlePresetsWrap
        .querySelectorAll(".image-compressor-btn.small")
        .forEach((b) => b.classList.remove("active"));
    }
    if (group === "bulk" && bulkPresetsWrap) {
      bulkPresetsWrap
        .querySelectorAll(".image-compressor-btn.small")
        .forEach((b) => b.classList.remove("active"));
    }
  }

  function setPresetActive(group, preset) {
    clearPresetActive(group);
    const wrap = group === "single" ? singlePresetsWrap : bulkPresetsWrap;
    if (!wrap) return;
    const btn = wrap.querySelector(
      `[data-preset${group === "bulk" ? "-bulk" : ""}="${preset}"]`
    );
    if (btn) btn.classList.add("active");
  }

  function updatePresetVisibility() {
    if (!singlePresetsWrap || !bulkPresetsWrap) return;

    if (items.length === 0) {
      singlePresetsWrap.style.display = "none";
      bulkPresetsWrap.style.display = "none";
      return;
    }

    if (items.length === 1) {
      singlePresetsWrap.style.display = "flex";
      bulkPresetsWrap.style.display = "none";
    } else {
      singlePresetsWrap.style.display = "none";
      bulkPresetsWrap.style.display = "flex";
    }
  }

  // ------- COMPRESS -------
  async function compressItem(item, context) {
    const li = document.getElementById("image-compressor-item-" + item.id);
    if (!li) return;

    const status = li.querySelector(".image-compressor-status");
    const after = li.querySelector("[data-after]");
    const diff = li.querySelector("[data-diff]");
    const btn = li.querySelector("[data-action='compress']");
    const dl = li.querySelector("[data-action='download']");

    if (status) {
      status.textContent = "Compressing…";
      status.className = "image-compressor-status";
    }
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Working…";
    }

    try {
      const dims = await readImageDimensions(item.file);
      lastDims = dims; // used for ratio
      item.originalWidth = dims.width;
      item.originalHeight = dims.height;

      const target = computeTargetSize(dims.width, dims.height, context);

      const img = await fileToImage(item.file);
      const canvas = drawToCanvas(img, target.width, target.height);

      const mime = getOutputMime(item.file.type);
      const quality = parseInt(qualityRange.value, 10) / 100;

      const blob = await canvasToBlob(canvas, mime, quality);

      item.compressedBlob = blob;
      item.compressedSize = blob.size;
      item.outputWidth = target.width;
      item.outputHeight = target.height;
      item.outputMime = mime;

      const saved =
        ((item.originalSize - item.compressedSize) / item.originalSize) * 100;

      if (after) after.textContent = humanSize(item.compressedSize);
      if (diff) {
        diff.textContent =
          (saved > 0 ? "-" : "") + formatPercent(Math.abs(saved));
      }

      const dimSpan = li.querySelector("[data-dim]");
      if (dimSpan) {
        dimSpan.textContent = `Resolution: ${item.outputWidth}×${item.outputHeight}`;
      }

      if (status) {
        status.textContent = "Compressed";
        status.className = "image-compressor-status success";
      }
      if (dl) dl.disabled = false;

      if (btn) {
        btn.textContent = "Done!";
        setTimeout(() => {
          if (btn) btn.textContent = "Compress";
        }, 900);
      }
    } catch (e) {
      console.error(e);
      if (status) {
        status.textContent = "Failed to compress";
        status.className = "image-compressor-status error";
      }
      if (btn) {
        btn.textContent = "Error";
        setTimeout(() => {
          if (btn) btn.textContent = "Compress";
        }, 900);
      }
    } finally {
      if (btn) btn.disabled = false;
      updateButtonsState();
    }
  }

  async function compressAll() {
    if (!items.length) return;
    if (compressAllBtn) {
      compressAllBtn.disabled = true;
      compressAllBtn.textContent = "Compressing…";
    }

    for (const item of items) {
      if (!item.compressedBlob) {
        // batch context
        await compressItem(item, "batch");
      }
    }

    if (compressAllBtn) {
      compressAllBtn.textContent = "Done!";
      setTimeout(() => {
        compressAllBtn.textContent = "Compress all";
        compressAllBtn.disabled = false;
      }, 1200);
    }
  }

  // ------- DOM RENDER -------
  function addItemToDOM(item) {
    const li = document.createElement("li");
    li.className = "image-compressor-item";
    li.id = "image-compressor-item-" + item.id;

    li.innerHTML = `
      <img class="image-compressor-thumb" src="">
      <div class="image-compressor-item-main">
        <div class="image-compressor-file-name">${item.name}</div>
        <div class="image-compressor-meta-row">
          <span>Original: ${humanSize(item.originalSize)}</span>
          <span data-dim>Resolution: —</span>
        </div>
        <div class="image-compressor-meta-row">
          <span>Compressed: <span data-after>—</span></span>
          <span>Saved: <span data-diff>—</span></span>
        </div>
        <div class="image-compressor-status">Waiting</div>
      </div>

      <div class="image-compressor-item-actions">
        <button class="image-compressor-btn primary" data-action="compress">Compress</button>
        <button class="image-compressor-btn ghost" data-action="download" disabled>Download</button>
        <button class="image-compressor-btn ghost" data-action="remove">Remove</button>
      </div>
    `;

    const thumb = li.querySelector(".image-compressor-thumb");
    const url = URL.createObjectURL(item.file);
    thumb.src = url;
    thumb.onload = () => URL.revokeObjectURL(url);

    listEl.appendChild(li);

    const compressBtn = li.querySelector("[data-action='compress']");
    const downloadBtn = li.querySelector("[data-action='download']");
    const removeBtn = li.querySelector("[data-action='remove']");

    if (compressBtn) {
      compressBtn.addEventListener("click", () => compressItem(item, "single"));
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        if (!item.compressedBlob) return;
        const ext =
          item.outputMime === "image/png"
            ? "png"
            : item.outputMime === "image/webp"
            ? "webp"
            : "jpg";

        const base = item.name.replace(/\.[^/.]+$/, "");
        const filename = base + "_compressed." + ext;

        const blobUrl = URL.createObjectURL(item.compressedBlob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();

        setTimeout(() => URL.revokeObjectURL(blobUrl), 500);

        downloadBtn.textContent = "Saved!";
        setTimeout(() => {
          downloadBtn.textContent = "Download";
        }, 900);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        items = items.filter((it) => it.id !== item.id);
        li.style.opacity = "0";
        li.style.transform = "translateY(4px)";
        setTimeout(() => li.remove(), 180);

        removeBtn.textContent = "Removed";
        setTimeout(() => {
          if (removeBtn.isConnected) removeBtn.textContent = "Remove";
        }, 900);

        updateButtonsState();
      });
    }

    // original resolution + single-image auto-fill for resize inputs
    readImageDimensions(item.file)
      .then((dims) => {
        const dimSpan = li.querySelector("[data-dim]");
        if (dimSpan) {
          dimSpan.textContent = `Resolution: ${dims.width}×${dims.height}`;
        }
        lastDims = dims;

        // If only one image in queue, show actual dims in inputs (for user info)
        if (items.length === 1) {
          if (!resizeEnable.checked) {
            widthInput.value = dims.width;
            heightInput.value = dims.height;
          }
        }
      })
      .catch(() => {});
  }

  // ------- FILE HANDLING -------
  function handleFiles(files) {
    setError("");

    const incoming = Array.from(files);
    if (!incoming.length) return;

    if (items.length + incoming.length > MAX_FILES) {
      setError(
        `You can add up to ${MAX_FILES} images at once. Remove some images before adding more.`
      );
      return;
    }

    incoming.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Some files were ignored because they are not images.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Some files are larger than 15 MB and were skipped.");
        return;
      }

      const id = idCounter++;
      const item = {
        id,
        file,
        name: file.name,
        originalSize: file.size,
        compressedBlob: null,
        compressedSize: 0,
        originalWidth: null,
        originalHeight: null,
        outputWidth: null,
        outputHeight: null,
        outputMime: null,
      };
      items.push(item);
      addItemToDOM(item);
    });

    updateButtonsState();
  }

  // ------- DOWNLOAD ALL (ZIP) -------
  async function downloadAllCompressed() {
    if (typeof JSZip === "undefined") return;
    downloadAllBtn.textContent = "Preparing…";

    const zip = new JSZip();
    let count = 0;

    for (const item of items) {
      if (!item.compressedBlob) continue;
      const ext =
        item.outputMime === "image/png"
          ? "png"
          : item.outputMime === "image/webp"
          ? "webp"
          : "jpg";
      const base = item.name.replace(/\.[^/.]+$/, "");
      const filename = base + "_compressed." + ext;
      zip.file(filename, item.compressedBlob);
      count++;
    }

    if (!count) {
      downloadAllBtn.textContent = "Nothing to download";
      setTimeout(
        () => (downloadAllBtn.textContent = "Download all as ZIP"),
        1200
      );
      return;
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed-images.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);

    downloadAllBtn.textContent = "Done!";
    setTimeout(
      () => (downloadAllBtn.textContent = "Download all as ZIP"),
      1200
    );
  }

  // ------- RESET / DEFAULTS -------
  function resetControls() {
    if (qualityRange && qualityValue) {
      qualityRange.value = 75;
      qualityValue.textContent = "75%";
    }

    if (formatSelect) formatSelect.value = "original";

    if (resizeEnable) resizeEnable.checked = false;
    if (widthInput) widthInput.value = "";
    if (heightInput) heightInput.value = "";
    if (keepRatio) keepRatio.checked = true;
    updateResizeUI();

    if (stripMetadata) stripMetadata.checked = true;

    items = [];
    listEl.innerHTML = "";

    activeSinglePreset = null;
    activeBulkPreset = null;
    clearPresetActive("single");
    clearPresetActive("bulk");
    updatePresetVisibility();

    setError("");
    updateButtonsState();
  }

  // ------- EVENTS: DROPZONE -------
  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("active");
  });

  dropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropzone.classList.remove("active");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("active");
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    fileInput.value = "";
  });

  // ------- EVENTS: QUALITY -------
  qualityRange.addEventListener("input", () => {
    qualityValue.textContent = qualityRange.value + "%";
  });

  qualityPresetBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      const q = parseInt(btn.dataset.quality, 10);
      if (Number.isNaN(q)) return;
      qualityRange.value = q;
      qualityValue.textContent = q + "%";
    })
  );

  // ------- EVENTS: RESIZE / RATIO -------
  resizeEnable.addEventListener("change", () => {
    updateResizeUI();
  });

  widthInput.addEventListener("input", () => {
    if (!resizeEnable.checked || !keepRatio.checked || !lastDims) return;
    const w = parseInt(widthInput.value, 10);
    if (!w) return;
    const h = Math.round((w / lastDims.width) * lastDims.height);
    heightInput.value = h;
  });

  heightInput.addEventListener("input", () => {
    if (!resizeEnable.checked || !keepRatio.checked || !lastDims) return;
    const h = parseInt(heightInput.value, 10);
    if (!h) return;
    const w = Math.round((h / lastDims.height) * lastDims.width);
    widthInput.value = w;
  });

  // ------- EVENTS: PRESETS (SINGLE) -------
  if (singlePresetsWrap) {
    singlePresetsWrap
      .querySelectorAll(".image-compressor-btn.small")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const preset = btn.dataset.preset;
          if (!preset || !lastDims) return;

          activeSinglePreset = preset;
          setPresetActive("single", preset);

          // user sees some dimension preview if resize enabled
          resizeEnable.checked = true;
          updateResizeUI();

          const size = computePresetSize(
            preset,
            lastDims.width,
            lastDims.height
          );
          widthInput.value = size.width;
          heightInput.value = size.height;
        });
      });
  }

  // ------- EVENTS: PRESETS (BULK) -------
  if (bulkPresetsWrap) {
    bulkPresetsWrap
      .querySelectorAll(".image-compressor-btn.small")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const preset = btn.dataset.presetBulk;
          if (!preset) return;
          activeBulkPreset = preset;
          setPresetActive("bulk", preset);

          // For bulk presets, we DO NOT force resize inputs,
          // compression will compute sizes per-image automatically.
        });
      });
  }

  // ------- EVENTS: MAIN BUTTONS -------
  compressAllBtn.addEventListener("click", compressAll);

  clearAllBtn.addEventListener("click", () => {
    clearAllBtn.textContent = "Cleared!";
    setTimeout(() => (clearAllBtn.textContent = "Clear all"), 1000);
    resetControls();
  });

  downloadAllBtn.addEventListener("click", downloadAllCompressed);

  // ------- INIT -------
  resetControls();
})();

/* =======================================================
   IMAGE COMPRESSOR — ANIMATION ENGINE (Non-destructive)
======================================================= */

// Page initial fade
window.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".image-compressor-container");
  if (container) {
    requestAnimationFrame(() => container.classList.add("ic-visible"));
  }
});

// Scroll-based reveals
(function () {
  const blocks = document.querySelectorAll(
    ".image-compressor-upload-card, .image-compressor-settings-card, .image-compressor-queue-section, .image-compressor-content, .image-compressor-faq"
  );

  if (!("IntersectionObserver" in window)) {
    blocks.forEach((b) => b.classList.add("ic-block-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("ic-block-visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  blocks.forEach((blk) => observer.observe(blk));
})();

// Fade-in queue items when added
const icListObserver = new MutationObserver((mut) => {
  mut.forEach((m) => {
    m.addedNodes.forEach((node) => {
      if (node.classList && node.classList.contains("image-compressor-item")) {
        requestAnimationFrame(() => node.classList.add("ic-item-visible"));
      }
    });
  });
});

const icList = document.querySelector("#image-compressor-list");
if (icList) {
  icListObserver.observe(icList, { childList: true });
}

/* ==========================================================
   IMAGE COMPRESSOR — MOBILE/TABLET CLICK ANIMATION
========================================================== */

(function () {
  // sirf touch devices par enable
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  const btns = document.querySelectorAll(".image-compressor-btn");

  btns.forEach((btn) => {
    btn.addEventListener("touchstart", () => {
      btn.classList.add("ic-tap");
    });

    btn.addEventListener(
      "touchend",
      () => {
        setTimeout(() => btn.classList.remove("ic-tap"), 120);
      },
      { passive: true }
    );
  });
})();