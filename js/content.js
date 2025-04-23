// 토글 버튼 생성
const toggleBtn = document.createElement("button");
toggleBtn.innerText = "📃";
toggleBtn.style.position = "fixed";
toggleBtn.style.top = "10px";
toggleBtn.style.right = "10px";
toggleBtn.style.zIndex = "10000";
toggleBtn.style.padding = "8px";
toggleBtn.style.fontSize = "16px";
toggleBtn.style.border = "none";
toggleBtn.style.borderRadius = "8px";
toggleBtn.style.background = "#fff";
toggleBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
toggleBtn.style.cursor = "pointer";

document.body.appendChild(toggleBtn);

// 사이드바 iframe 생성
const sidebar = document.createElement("iframe");
sidebar.src = chrome.runtime.getURL("html/sidebar.html");
sidebar.style.position = "fixed";
sidebar.style.top = "0";
sidebar.style.right = "0";
sidebar.style.width = "300px";
sidebar.style.height = "100%";
sidebar.style.border = "none";
sidebar.style.zIndex = "9999";
sidebar.style.transition = "transform 0.3s ease-in-out";
sidebar.style.transform = "translateX(100%)"; // 처음에는 숨김

document.body.appendChild(sidebar);

// 토글 버튼 클릭 시 사이드바 열기/닫기
let isSidebarOpen = false;
toggleBtn.addEventListener("click", () => {
    isSidebarOpen = !isSidebarOpen;
    sidebar.style.transform = isSidebarOpen ? "translateX(0)" : "translateX(100%)";
});

// 1. 썸네일에 드래그 속성 추가
function enableDragOnThumbnails() {
    const thumbnails = document.querySelectorAll("a#thumbnail");
    thumbnails.forEach((thumb) => {
        thumb.setAttribute("draggable", true);

        thumb.addEventListener("dragstart", (e) => {
            const url = thumb.href;
            const title = thumb.closest("ytd-video-renderer")?.querySelector("#video-title")?.textContent || "제목 없음";
            e.dataTransfer.setData("text/plain", JSON.stringify({ title, url }));
        });
    });
}

// 2. 사이드바 드롭 영역 감지
function enableSidebarDrop() {
    const sidebarFrame = document.querySelector("iframe[src*='sidebar.html']");
    if (!sidebarFrame) return;

    sidebarFrame.addEventListener("load", () => {
        const sidebarWindow = sidebarFrame.contentWindow;

        // 사이드바에 파일을 드롭하면 이벤트 넘겨받기
        sidebarFrame.contentWindow.document.body.addEventListener("dragover", (e) => e.preventDefault());
        sidebarFrame.contentWindow.document.body.addEventListener("drop", (e) => {
            e.preventDefault();
            const raw = e.dataTransfer.getData("text/plain");
            if (!raw) return;
            try {
                const data = JSON.parse(raw);
                if (data?.url) {
                    chrome.runtime.sendMessage({ action: "addToPlaylist", item: data });
                }
            } catch (err) {
                console.error("드롭 데이터 파싱 실패", err);
            }
        });
    });
}

// 초기화 실행
setTimeout(() => {
    enableDragOnThumbnails();
    enableSidebarDrop();
}, 2000);

