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

            // 썸네일 이미지
            const img = document.createElement("img");
            img.src = item.thumbnail || "https://via.placeholder.com/80x45?text=No+Thumbnail";
            img.alt = "썸네일";
            img.style.width = "80px";
            img.style.height = "45px";
            img.style.flexShrink = "0";
            img.style.borderRadius = "4px";
            img.style.marginRight = "8px";

            // 텍스트 링크 (제목)
            const link = document.createElement("span");
            link.textContent = item.title || item.url;
            link.style.cursor = "pointer";
            link.style.textDecoration = "underline";
            link.style.flexGrow = "1";
            link.style.whiteSpace = "nowrap";
            link.style.overflow = "hidden";
            link.style.textOverflow = "ellipsis";

            // 클릭 시 본창에서 이동
            link.addEventListener("click", () => {
                // 1. 먼저 사이드바 닫기
                window.parent.postMessage({ action: "closeSidebar" }, "*");

                // 2. 이동 요청
                setTimeout(() => {
                    chrome.runtime.sendMessage({
                        action: "navigateToUrl",
                        url: item.url
                    });
                }, 300);
            });

            // 삭제 버튼
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.addEventListener("click", () => {
                playlist.splice(index, 1);
                chrome.storage.local.set({ playlist });
                loadPlaylist();
            });

            // 텍스트 + 이미지 묶기
            const contentBox = document.createElement("div");
            contentBox.style.display = "flex";
            contentBox.style.alignItems = "center";
            contentBox.style.gap = "8px";
            contentBox.style.flexGrow = "1";
            contentBox.appendChild(img);
            contentBox.appendChild(link);

            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.justifyContent = "space-between";
            li.appendChild(contentBox);
            li.appendChild(removeBtn);

            ul.appendChild(li);
        });
    });
}


// 메시지 수신 → 영상 추가
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "addToPlaylist") {
//         chrome.storage.local.get(["playlist"], (result) => {
//             const playlist = result.playlist || [];
//             playlist.push(request.item);
//             chrome.storage.local.set({ playlist }, () => {
//                 loadPlaylist();
//             });
//         });
//     }
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "navigateToUrl" && request.url) {
        window.location.href = request.url;
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

    // 저장 버튼
    saveBtn.addEventListener("click", async () => {
        const url = urlInput.value.trim();
        if (!url.includes("youtube.com/watch")) {
            alert("유효한 유튜브 영상 링크를 입력해주세요.");
            return;
        }

        const videoId = new URL(url).searchParams.get("v");
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        let title = "제목 불러오는 중...";
        try {
            const res = await fetch(url);
            const text = await res.text();
            const matches = text.match(/<title>(.*?)<\/title>/);
            if (matches && matches[1]) {
                title = matches[1].replace(" - YouTube", "").trim();
            }
        } catch (e) {
            console.error("제목 불러오기 실패:", e);
        }

        chrome.storage.local.get(["playlist"], (result) => {
            const playlist = result.playlist || [];
            playlist.push({ title, url, thumbnail });
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
