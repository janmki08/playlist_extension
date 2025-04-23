let isSidebarOpen = false;

// 📘 사이드바 iframe 생성
const sidebar = document.createElement("iframe");
sidebar.src = chrome.runtime.getURL("html/sidebar.html");
Object.assign(sidebar.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "300px",
    height: "100%",
    border: "none",
    zIndex: "9999",
    transition: "transform 0.3s ease-in-out",
    transform: "translateX(295px)", // 처음엔 숨김
    pointerEvents: "auto" // 항상 클릭 가능
});
document.body.appendChild(sidebar);

// 🟥 감지존 생성 (테스트용 배경)
const edgeZone = document.createElement("div");
Object.assign(edgeZone.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "10px",
    height: "100%",
    zIndex: "9998",
    cursor: "pointer",
    backgroundColor: "rgba(255, 0, 0, 0.2)" // 테스트용
});
document.body.appendChild(edgeZone);

// 🟦 클릭 오버레이 (iframe 위 클릭 감지용)
const clickOverlay = document.createElement("div");
Object.assign(clickOverlay.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "30px", // 슬쩍 나온 범위
    height: "100%",
    zIndex: "10000", // iframe 위에 위치
    cursor: "pointer",
    backgroundColor: "rgba(0, 0, 255, 0.2)", // 테스트용
    display: "none"
});
document.body.appendChild(clickOverlay);

// 👉 감지존 진입: 사이드바 살짝 보이기
edgeZone.addEventListener("mouseenter", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(270px)";
        clickOverlay.style.display = "block";
    }
});

// 👉 감지존 벗어남: 다시 숨기기
edgeZone.addEventListener("mouseleave", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(295px)";
        clickOverlay.style.display = "none";
    }
});

// 🖱 클릭 오버레이 클릭 → 전체 펼침
clickOverlay.addEventListener("click", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(0)";
        isSidebarOpen = true;
        clickOverlay.style.display = "none";
    }
});

// 📦 바깥 클릭 시 닫기
document.addEventListener("click", (e) => {
    const mouseX = e.clientX;
    const screenWidth = window.innerWidth;
    if (isSidebarOpen && mouseX < screenWidth - 300) {
        sidebar.style.transform = "translateX(295px)";
        isSidebarOpen = false;
        clickOverlay.style.display = "none";
    }
});

// 테마 동기화
function sendThemeToSidebar() {
    const app = document.querySelector("ytd-app");
    if (!app) return;
    const isDark = app.classList.contains("dark");
    sidebar.contentWindow?.postMessage({ theme: isDark ? "dark" : "light" }, "*");
}

function observeThemeChange() {
    const app = document.querySelector("ytd-app");
    if (!app) return;

    const observer = new MutationObserver(() => {
        sendThemeToSidebar();
    });
    observer.observe(app, { attributes: true, attributeFilter: ["class"] });

    // 초기에 한 번 보내기
    sendThemeToSidebar();
}

// iframe이 완전히 로드됐을 때만 실행
sidebar.addEventListener("load", () => {
    observeThemeChange();
});
