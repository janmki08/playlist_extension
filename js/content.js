// 기본 상태
let isSidebarOpen = false;

// 사이드바 생성
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
    transform: "translateX(295px)", // 완전 숨김
    pointerEvents: "auto" // 항상 클릭 가능
});
document.body.appendChild(sidebar);

// 감지존
const edgeZone = document.createElement("div");
Object.assign(edgeZone.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "10px",
    height: "100%",
    zIndex: "9998",
    cursor: "pointer"
});
document.body.appendChild(edgeZone);

// 마우스 진입 시 살짝 나옴
edgeZone.addEventListener("mouseenter", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(270px)"; // 30px 보이기
    }
});

// 마우스 벗어나면 다시 숨김
edgeZone.addEventListener("mouseleave", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(295px)";
    }
});

// document 클릭 감지 → 슬쩍 나왔을 때 클릭 시 전체 펼치기
document.addEventListener("click", (e) => {
    const mouseX = e.clientX;
    const screenWidth = window.innerWidth;

    // 슬쩍 나왔을 때 보이는 30px 안쪽 클릭이면 열기
    if (!isSidebarOpen && mouseX > screenWidth - 30) {
        sidebar.style.transform = "translateX(0)";
        isSidebarOpen = true;
        return;
    }

    // 열린 상태에서 바깥 클릭 시 닫기
    if (isSidebarOpen && mouseX < screenWidth - 300) {
        sidebar.style.transform = "translateX(295px)";
        isSidebarOpen = false;
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
