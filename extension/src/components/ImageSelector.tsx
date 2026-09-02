export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageSelectorProps {
  imageElement: HTMLImageElement;
  onConfirm: (croppedDataBase64: string) => void;
  onCancel: () => void;
}

let activeOverlayElement: HTMLElement | null = null;

export function removeExistingOverlays() {
  if (activeOverlayElement) {
    activeOverlayElement.remove();
    activeOverlayElement = null;
  }
  document.querySelectorAll('.pinterest-crop-overlay').forEach((el) => el.remove());
}

function getImageContentRect(img: HTMLImageElement) {
  const elemRect = img.getBoundingClientRect();
  const naturalW = img.naturalWidth || elemRect.width;
  const naturalH = img.naturalHeight || elemRect.height;

  const computedStyle = window.getComputedStyle(img);
  const objectFit = computedStyle.objectFit;

  let renderW = elemRect.width;
  let renderH = elemRect.height;
  let renderX = elemRect.left;
  let renderY = elemRect.top;

  const arNat = naturalW / naturalH;
  const arElem = elemRect.width / elemRect.height;

  if (objectFit === 'cover') {
    if (arNat > arElem) {
      renderW = elemRect.height * arNat;
      renderH = elemRect.height;
      renderX = elemRect.left - (renderW - elemRect.width) / 2;
      renderY = elemRect.top;
    } else {
      renderW = elemRect.width;
      renderH = elemRect.width / arNat;
      renderX = elemRect.left;
      renderY = elemRect.top - (renderH - elemRect.height) / 2;
    }
  } else if (objectFit === 'contain') {
    if (arNat > arElem) {
      renderW = elemRect.width;
      renderH = elemRect.width / arNat;
      renderX = elemRect.left;
      renderY = elemRect.top + (elemRect.height - renderH) / 2;
    } else {
      renderW = elemRect.height * arNat;
      renderH = elemRect.height;
      renderX = elemRect.left + (elemRect.width - renderW) / 2;
      renderY = elemRect.top;
    }
  }

  const scaleX = naturalW / renderW;
  const scaleY = naturalH / renderH;

  return {
    renderX,
    renderY,
    renderW,
    renderH,
    scaleX,
    scaleY,
    naturalW,
    naturalH
  };
}

async function getUntaintedCroppedBase64(
  img: HTMLImageElement,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, cropW);
  canvas.height = Math.max(1, cropH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imgUrl = img.currentSrc || img.src;

  // Strategy A: Fetch image as Blob & createImageBitmap to bypass cross-origin canvas taint
  try {
    const res = await fetch(imgUrl);
    if (res.ok) {
      const blob = await res.blob();
      const bitmap = await createImageBitmap(blob);
      ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      return canvas.toDataURL('image/jpeg', 0.9);
    }
  } catch (errA) {
    console.warn('Blob fetch crop failed, trying offscreen Image object:', errA);
  }

  // Strategy B: Offscreen Image with crossOrigin
  return new Promise((resolve, reject) => {
    const offscreen = new Image();
    offscreen.crossOrigin = 'anonymous';
    offscreen.onload = () => {
      try {
        ctx.drawImage(offscreen, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch (errB) {
        reject(errB);
      }
    };
    offscreen.onerror = (e) => reject(new Error('Failed to load image for cropping'));
    offscreen.src = imgUrl;
  });
}

export function createSelectionOverlay(
  img: HTMLImageElement,
  onConfirm: (croppedBase64: string) => void,
  onCancel: () => void
) {
  removeExistingOverlays();

  const overlay = document.createElement('div');
  overlay.className = 'pinterest-crop-overlay';
  activeOverlayElement = overlay;

  const imgRect = img.getBoundingClientRect();

  // Initial box centered inside image (60% width & height)
  let box = {
    x: imgRect.left + imgRect.width * 0.2,
    y: imgRect.top + imgRect.height * 0.2,
    width: imgRect.width * 0.6,
    height: imgRect.height * 0.6,
  };

  let isDragging = false;
  let isResizing = false;
  let activeHandle = '';
  let startX = 0;
  let startY = 0;
  let startBox = { ...box };

  const renderUI = () => {
    overlay.innerHTML = `
      <div style="position: absolute; left: ${box.x}px; top: ${box.y}px; width: ${box.width}px; height: ${box.height}px; outline: 3px solid #E60023; box-shadow: 0 0 0 9999px rgba(0,0,0,0.65); cursor: move;" id="pj-selection-box">
        <!-- Handles -->
        <div data-handle="tl" style="position: absolute; top: -6px; left: -6px; width: 12px; height: 12px; background: white; border: 2px solid #E60023; border-radius: 50%; cursor: nwse-resize;"></div>
        <div data-handle="tr" style="position: absolute; top: -6px; right: -6px; width: 12px; height: 12px; background: white; border: 2px solid #E60023; border-radius: 50%; cursor: nesw-resize;"></div>
        <div data-handle="bl" style="position: absolute; bottom: -6px; left: -6px; width: 12px; height: 12px; background: white; border: 2px solid #E60023; border-radius: 50%; cursor: nesw-resize;"></div>
        <div data-handle="br" style="position: absolute; bottom: -6px; right: -6px; width: 12px; height: 12px; background: white; border: 2px solid #E60023; border-radius: 50%; cursor: nwse-resize;"></div>
        
        <!-- Action bar -->
        <div style="position: absolute; bottom: -48px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: #18181b; padding: 6px 12px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 1000000;" id="pj-action-bar">
          <button id="pj-btn-confirm" style="background: #E60023; color: white; border: none; padding: 6px 14px; border-radius: 16px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Find Similar Products
          </button>
          <button id="pj-btn-cancel" style="background: #3f3f46; color: white; border: none; padding: 6px 12px; border-radius: 16px; font-weight: 500; font-size: 13px; cursor: pointer;">
            Cancel
          </button>
        </div>
      </div>
    `;

    const confirmBtn = overlay.querySelector('#pj-btn-confirm');
    const cancelBtn = overlay.querySelector('#pj-btn-cancel');

    confirmBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      cropAndProcess();
    });

    cancelBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      cleanup();
      onCancel();
    });
  };

  const cleanup = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    overlay.remove();
    if (activeOverlayElement === overlay) {
      activeOverlayElement = null;
    }
  };

  const cropAndProcess = async () => {
    try {
      const { renderX, renderY, scaleX, scaleY, naturalW, naturalH } = getImageContentRect(img);

      let cropX = (box.x - renderX) * scaleX;
      let cropY = (box.y - renderY) * scaleY;
      let cropW = box.width * scaleX;
      let cropH = box.height * scaleY;

      cropX = Math.max(0, Math.min(naturalW - 1, cropX));
      cropY = Math.max(0, Math.min(naturalH - 1, cropY));
      cropW = Math.max(1, Math.min(naturalW - cropX, cropW));
      cropH = Math.max(1, Math.min(naturalH - cropY, cropH));

      // Visual loading feedback on confirm button
      const confirmBtn = overlay.querySelector('#pj-btn-confirm');
      if (confirmBtn) {
        confirmBtn.textContent = 'Processing...';
      }

      const croppedBase64 = await getUntaintedCroppedBase64(img, cropX, cropY, cropW, cropH);
      cleanup();
      onConfirm(croppedBase64);
    } catch (err) {
      console.error('Error cropping image:', err);
      cleanup();
      onCancel();
    }
  };

  const onMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const handle = target.getAttribute('data-handle');
    if (handle) {
      isResizing = true;
      activeHandle = handle;
      startX = e.clientX;
      startY = e.clientY;
      startBox = { ...box };
      e.stopPropagation();
      return;
    }

    const selectionBox = overlay.querySelector('#pj-selection-box');
    if (selectionBox && selectionBox.contains(target)) {
      if (target.closest('#pj-action-bar')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startBox = { ...box };
      e.stopPropagation();
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (isDragging) {
      box.x = Math.max(imgRect.left, Math.min(imgRect.right - box.width, startBox.x + dx));
      box.y = Math.max(imgRect.top, Math.min(imgRect.bottom - box.height, startBox.y + dy));
      renderUI();
    } else if (isResizing) {
      if (activeHandle.includes('r')) {
        box.width = Math.max(40, Math.min(imgRect.right - startBox.x, startBox.width + dx));
      }
      if (activeHandle.includes('b')) {
        box.height = Math.max(40, Math.min(imgRect.bottom - startBox.y, startBox.height + dy));
      }
      if (activeHandle.includes('l')) {
        const newW = Math.max(40, startBox.width - dx);
        box.x = startBox.x + (startBox.width - newW);
        box.width = newW;
      }
      if (activeHandle.includes('t')) {
        const newH = Math.max(40, startBox.height - dy);
        box.y = startBox.y + (startBox.height - newH);
        box.height = newH;
      }
      renderUI();
    }
  };

  const onMouseUp = () => {
    isDragging = false;
    isResizing = false;
  };

  overlay.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  document.body.appendChild(overlay);
  renderUI();
}
