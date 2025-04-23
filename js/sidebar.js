function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
}

function toggleTheme() {
    chrome.storage.local.get(["theme"], (result) => {
        const newTheme = result.theme === "dark" ? "light" : "dark";
        chrome.storage.local.set({ theme: newTheme }, () => {
            applyTheme(newTheme);
        });
    });
}

// 저장된 재생목록 불러오기
function loadPlaylist() {
    chrome.storage.local.get(["playlist"], (result) => {
        const playlist = result.playlist || [];
        const ul = document.getElementById("playlist");
        ul.innerHTML = "";

        playlist.forEach((item, index) => {
            const li = document.createElement("li");

            const link = document.createElement("a");
            link.href = item.url;
            link.target = "_blank";
            link.textContent = item.title || item.url;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.addEventListener("click", () => {
                playlist.splice(index, 1);
                chrome.storage.local.set({ playlist });
                loadPlaylist();
            });

            li.appendChild(link);
            li.appendChild(removeBtn);
            ul.appendChild(li);
        });
    });
}

// 메시지 수신 → 영상 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "addToPlaylist") {
        chrome.storage.local.get(["playlist"], (result) => {
            const playlist = result.playlist || [];
            playlist.push(request.item);
            chrome.storage.local.set({ playlist }, () => {
                loadPlaylist();
            });
        });
    }
});

// 초기화
document.addEventListener("DOMContentLoaded", () => {
    loadPlaylist();

    chrome.storage.local.get(["theme"], (result) => {
        const savedTheme = result.theme || "light";
        applyTheme(savedTheme);
    });

    const saveBtn = document.getElementById("save-btn");
    const urlInput = document.getElementById("video-url");
    saveBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();
        if (!url || !url.includes("youtube.com/watch")) {
            alert("유효한 유튜브 영상 링크를 입력해주세요.");
            return;
        }

        const title = "링크 저장됨";
        chrome.storage.local.get(["playlist"], (result) => {
            const playlist = result.playlist || [];
            playlist.push({ title, url });
            chrome.storage.local.set({ playlist }, () => {
                urlInput.value = "";
                loadPlaylist();
            });
        });
    });

    // 테마 토글 버튼
    const themeToggleBtn = document.getElementById("theme-toggle");
    themeToggleBtn.addEventListener("click", toggleTheme);
});
