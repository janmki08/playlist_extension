// 테마 적용
function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
}

// 테마 토글
function toggleTheme() {
    chrome.storage.local.get(["theme"], (result) => {
        const newTheme = result.theme === "dark" ? "light" : "dark";
        chrome.storage.local.set({ theme: newTheme }, () => {
            applyTheme(newTheme);
        });
    });
}

// 테마 변경
document.getElementById("theme-select").addEventListener("change", (e) => {
    const theme = e.target.value;
    chrome.storage.local.set({ theme }, () => {
        applyTheme(theme);
    });
});

// 드래그 정렬 적용
function enableDragSorting() {
    const list = document.getElementById("playlist");
    new Sortable(list, {
        animation: 150,
        handle: ".drag-handle",
        onEnd: function (evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;

            if (oldIndex === newIndex) return;

            chrome.storage.local.get(["playlist"], (result) => {
                const playlist = result.playlist || [];
                const moved = playlist.splice(oldIndex, 1)[0];
                playlist.splice(newIndex, 0, moved);
                chrome.storage.local.set({ playlist }, () => {
                    loadPlaylist(); // 정렬 후 새로고침
                });
            });
        }
    });
}

// 저장된 재생목록 불러오기
function loadPlaylist() {
    chrome.storage.local.get(["playlist"], (result) => {
        const playlist = result.playlist || [];
        const ul = document.getElementById("playlist");
        ul.innerHTML = "";

        let dragSrcIndex = null;

        playlist.forEach((item, index) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.justifyContent = "space-between";
            li.style.marginBottom = "8px";
            li.draggable = true;

            // 드래그 핸들
            const handle = document.createElement("span");
            handle.textContent = "≡";
            handle.style.cursor = "grab";
            handle.classList.add("drag-handle");

            // 썸네일
            const img = document.createElement("img");
            img.src = item.thumbnail || "https://via.placeholder.com/110x68?text=No+Thumbnail";
            img.alt = "썸네일";
            img.style.width = "90px";
            img.style.height = "auto";
            img.style.flexShrink = "0";
            img.style.borderRadius = "8px";
            img.style.cursor = "pointer";
            img.classList.add("hover-zoom", "thumbnail-hover");

            // 제목
            const link = document.createElement("span");
            link.textContent = item.title || item.url;
            link.style.cursor = "pointer";
            link.classList.add("hover-zoom");
            link.style.flexGrow = "1";
            link.style.whiteSpace = "nowrap";
            link.style.overflow = "hidden";
            link.style.textOverflow = "ellipsis";
            link.style.minWidth = "0";

            link.addEventListener("mouseenter", (e) => {
                showTooltip(item.title, e.clientX, e.clientY);
            });

            link.addEventListener("mousemove", (e) => {
                showTooltip(item.title, e.clientX, e.clientY);
            });

            link.addEventListener("mouseleave", () => {
                hideTooltip();
            });

            img.addEventListener("mouseenter", (e) => {
                showTooltip(item.title, e.clientX, e.clientY);
            });

            img.addEventListener("mousemove", (e) => {
                showTooltip(item.title, e.clientX, e.clientY);
            });

            img.addEventListener("mouseleave", () => {
                hideTooltip();
            });

            const navigateToVideo = () => {
                window.parent.postMessage({ action: "closeSidebar" }, "*");
                setTimeout(() => {
                    chrome.runtime.sendMessage({
                        action: "navigateToUrl",
                        url: item.url
                    });
                }, 300);
            };

            link.addEventListener("click", navigateToVideo);
            img.addEventListener("click", navigateToVideo);

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.addEventListener("click", () => {
                playlist.splice(index, 1);
                chrome.storage.local.set({ playlist });
                loadPlaylist();
            });

            const contentBox = document.createElement("div");
            contentBox.style.display = "flex";
            contentBox.style.alignItems = "center";
            contentBox.style.gap = "5px";
            contentBox.style.flexGrow = "1";
            contentBox.style.maxWidth = "200px";
            contentBox.appendChild(img);
            contentBox.appendChild(link);

            li.appendChild(handle);
            li.appendChild(contentBox);
            li.appendChild(removeBtn);
            ul.appendChild(li);
        });
    });
}

// 언어 데이터
const languageData = {
    ko: {
        header: "🎵 내 재생목록",
        save: "저장",
        placeholder: "유튜브 링크 붙여넣기",
        theme: "🎨 테마",
        language: "🌐 언어",
        themeOptions: {
            light: "밝은 테마",
            dark: "어두운 테마"
        },
        toast_duplicate: "❗ 이미 저장된 영상입니다."
    },
    en: {
        header: "🎵 My Playlist",
        save: "Save",
        placeholder: "Paste YouTube link",
        theme: "🎨 Theme",
        language: "🌐 Language",
        themeOptions: {
            light: "Light Theme",
            dark: "Dark Theme"
        },
        toast_duplicate: "❗ This video is already saved."
    }
};

// 언어 적용 함수
function applyLanguage(lang) {
    const data = languageData[lang];

    document.querySelector("#header h2").textContent = data.header;
    document.getElementById("save-btn").textContent = data.save;
    document.getElementById("video-url").placeholder = data.placeholder;

    document.getElementById("theme-label").textContent = data.theme;
    document.getElementById("lang-label").textContent = data.language;

    // 테마 옵션 텍스트
    const themeSelect = document.getElementById("theme-select");
    themeSelect.options[0].textContent = data.themeOptions.light;
    themeSelect.options[1].textContent = data.themeOptions.dark;

    // 토스트 메시지용 변수 저장 (전역)
    window.currentToastText = data.toast_duplicate;
}

// 언어 변경
document.getElementById("lang-select").addEventListener("change", (e) => {
    const lang = e.target.value;
    chrome.storage.local.set({ lang }, () => {
        applyLanguage(lang);
    });
});

// 토스트 표시 함수
function showToast(message = window.currentToastText) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500); // 2.5초
}

// 툴팁
function showTooltip(text, x, y) {
    const tooltip = document.getElementById("custom-tooltip");
    tooltip.textContent = text;
    tooltip.style.opacity = "0";
    tooltip.classList.add("show");

    // 다음 프레임에서 위치 계산
    requestAnimationFrame(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        const padding = 12;

        let left = x + padding;
        let top = y + padding;

        // 오른쪽 화면 밖이면 왼쪽으로 이동
        if (left + tooltipRect.width > window.innerWidth) {
            left = x - tooltipRect.width - padding;
        }

        // 아래 화면 밖이면 위로 이동
        if (top + tooltipRect.height > window.innerHeight) {
            top = y - tooltipRect.height - padding;
        }

        tooltip.style.left = "0";
        tooltip.style.top = "0";
        tooltip.style.transform = `translate(${left}px, ${top}px)`;
        tooltip.style.opacity = "1";
    });
}

function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    tooltip.classList.remove("show");
}

// html 디코딩
function decodeHtmlEntities(str) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "navigateToUrl" && request.url) {
        window.location.href = request.url;
    }
});

// 초기화
document.addEventListener("DOMContentLoaded", () => {
    loadPlaylist();
    enableDragSorting();

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
            alert("유효한 유튜브 링크를 입력해주세요.");
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
                title = decodeHtmlEntities(matches[1].replace(" - YouTube", "").trim());
            }
        } catch (e) {
            console.error("제목 불러오기 실패:", e);
        }

        chrome.storage.local.get(["playlist"], (result) => {
            const playlist = result.playlist || [];

            const isDuplicate = playlist.some(item => item.url === url);
            if (isDuplicate) {
                showToast();
                return;
            }

            playlist.push({ title, url, thumbnail });
            chrome.storage.local.set({ playlist }, () => {
                urlInput.value = "";
                loadPlaylist();
            });
        });
    });

    // 사이드바 닫기 버튼
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