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

    const closeBtn = document.getElementById("close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            window.parent.postMessage({ action: "closeSidebar" }, "*");
        });
    }

    const input = document.getElementById("video-url");

    // 기본 동작 허용
    input.addEventListener("dragover", (e) => {
        e.preventDefault(); // 이게 없으면 기본 드롭 안됨
    });

    input.addEventListener("drop", (e) => {
        e.preventDefault(); // 기본 붙여넣기 막힘
        const text = e.dataTransfer.getData("text/plain");
        if (text.includes("youtube.com/watch")) {
            input.value = text.trim();
        }
    });

});

// 설정 토글
document.getElementById("theme-toggle").addEventListener("click", () => {
    const dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle("show");
});

// 테마 변경
document.getElementById("theme-select").addEventListener("change", (e) => {
    const theme = e.target.value;
    chrome.storage.local.set({ theme }, () => {
        applyTheme(theme);
    });
});

// 언어 변경
document.getElementById("lang-select").addEventListener("change", (e) => {
    const lang = e.target.value;
    chrome.storage.local.set({ lang }, () => {
        applyLanguage(lang);
    });
});

// 언어 적용 함수
function applyLanguage(lang) {
    const headerText = lang === "en" ? "🎵 My Playlist" : "🎵 내 재생목록";
    const saveBtn = document.getElementById("save-btn");
    const urlInput = document.getElementById("video-url");

    document.querySelector("#header h2").textContent = headerText;
    saveBtn.textContent = lang === "en" ? "Save" : "저장";
    urlInput.placeholder = lang === "en" ? "Paste YouTube link" : "유튜브 링크 붙여넣기";
}

// 초기 설정 불러오기
chrome.storage.local.get(["theme", "lang"], (result) => {
    const theme = result.theme || "light";
    const lang = result.lang || "ko";
    document.getElementById("theme-select").value = theme;
    document.getElementById("lang-select").value = lang;
    applyTheme(theme);
    applyLanguage(lang);
});
