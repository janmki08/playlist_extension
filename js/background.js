// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "navigateToUrl" && message.url) {
        // 현재 창에서 활성화된 탭 찾기
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (tabId) {
                // 그 탭에 스크립트 삽입 → location.href 변경
                chrome.scripting.executeScript({
                    target: { tabId },
                    func: (url) => {
                        window.location.href = url;
                    },
                    args: [message.url]
                });
            }
        });
    }
});
