import { createSelectionOverlay } from '../components/ImageSelector';

// Content script for Pinterest page interaction

function initPinterestExtension() {
  console.log('[Pinterest Visual Finder] Content script active');

  const processedImages = new WeakSet<HTMLImageElement>();

  function findBestPinterestImage(): HTMLImageElement | null {
    const specificSelectors = [
      '[data-test-id="main-pin-image"] img',
      '[data-test-id="pin-visual-wrapper"] img',
      'div[data-test-id="pin-image-wrapper"] img',
      'img[src*="pinimg.com/736x/"]',
      'img[src*="pinimg.com/originals/"]'
    ];

    for (const sel of specificSelectors) {
      const img = document.querySelector<HTMLImageElement>(sel);
      if (img && img.clientWidth > 150 && img.clientHeight > 150) {
        return img;
      }
    }

    const allImages = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
    const candidates = allImages.filter(img => {
      const src = img.src || '';
      return (
        (src.includes('pinimg.com') || src.startsWith('data:') || src.startsWith('http')) &&
        img.clientWidth > 180 &&
        img.clientHeight > 180
      );
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight));
      return candidates[0];
    }

    return null;
  }

  function launchSelectionForImage(img: HTMLImageElement) {
    console.log('[Pinterest Visual Finder] Launching crop selection overlay');

    // 1. Immediately request side panel opening
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });

    createSelectionOverlay(
      img,
      (croppedBase64) => {
        console.log('[Pinterest Visual Finder] Crop confirmed, sending to extension UI');
        
        // 2. Send fresh crop payload
        chrome.runtime.sendMessage({
          type: 'IMAGE_SELECTED',
          imageDataUrl: croppedBase64,
          sourceUrl: window.location.href,
          cropTimestamp: Date.now()
        });
      },
      () => {
        console.log('[Pinterest Visual Finder] Selection overlay cancelled');
      }
    );
  }

  function attachTriggerButtons() {
    const images = document.querySelectorAll<HTMLImageElement>(
      'img[src*="pinimg.com"], [data-test-id="pin-visual-wrapper"] img, [data-test-id="main-pin-image"] img'
    );

    images.forEach((img) => {
      if (processedImages.has(img)) return;
      if (img.clientWidth < 140 || img.clientHeight < 140) return;

      processedImages.add(img);

      const parent = img.parentElement;
      if (!parent) return;

      const computedStyle = window.getComputedStyle(parent);
      if (computedStyle.position === 'static') {
        parent.style.position = 'relative';
      }

      const btn = document.createElement('button');
      btn.className = 'pinterest-finder-btn';
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Find Similar</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        launchSelectionForImage(img);
      });

      parent.appendChild(btn);
    });
  }

  // Handle messages from Side Panel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_SELECTION_MODE') {
      const bestImg = findBestPinterestImage();
      if (bestImg) {
        launchSelectionForImage(bestImg);
        sendResponse({ success: true });
      } else {
        alert('No pin image detected on this page. Please open a Pinterest pin page.');
        sendResponse({ success: false, error: 'No image found' });
      }
      return true;
    }
  });

  attachTriggerButtons();

  const observer = new MutationObserver(() => {
    attachTriggerButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPinterestExtension);
} else {
  initPinterestExtension();
}
