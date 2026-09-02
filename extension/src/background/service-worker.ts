// Chrome Side Panel service worker

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Error setting panel behavior:', error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    const tabId = sender.tab?.id;
    const windowId = sender.tab?.windowId;

    if (tabId) {
      chrome.sidePanel.open({ tabId })
        .then(() => sendResponse({ success: true }))
        .catch((err) => {
          console.warn('Could not open tab sidepanel, trying windowId:', err);
          if (windowId) {
            chrome.sidePanel.open({ windowId })
              .then(() => sendResponse({ success: true }))
              .catch((e) => sendResponse({ success: false, error: e.message }));
          } else {
            sendResponse({ success: false, error: err.message });
          }
        });
      return true;
    }
  }

  if (message.type === 'IMAGE_SELECTED') {
    const imageDataUrl = message.imageDataUrl;
    const sourceUrl = message.sourceUrl;
    const tabId = sender.tab?.id;
    const windowId = sender.tab?.windowId;
    const cropTimestamp = Date.now();

    // 1. Force clear old cached image first, then set fresh crop payload
    chrome.storage.local.remove(['currentCroppedImage'], () => {
      chrome.storage.local.set({
        currentCroppedImage: imageDataUrl,
        sourcePageUrl: sourceUrl,
        cropTimestamp: cropTimestamp
      }, () => {
        // 2. Open side panel if tab context is available
        if (tabId) {
          chrome.sidePanel.open({ tabId }).catch(() => {
            if (windowId) chrome.sidePanel.open({ windowId }).catch(() => {});
          });
        }

        // 3. Broadcast message to side panel UI
        chrome.runtime.sendMessage({
          type: 'IMAGE_SELECTED',
          imageDataUrl: imageDataUrl,
          sourceUrl: sourceUrl,
          cropTimestamp: cropTimestamp
        }).catch(() => {
          // Handled via storage change fallback
        });

        sendResponse({ success: true });
      });
    });

    return true;
  }
});
