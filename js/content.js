// 사이드바 iframe 생성
const sidebar = document.createElement("iframe");
sidebar.src = chrome.runtime.getURL("html/sidebar.html");
Object.assign(sidebar.style, {
    position: "fixed",
    top: "0",
    right: "0",
    height: "100%",
    border: "none",
    zIndex: "9998",
    transition: "transform 0.3s ease-in-out",
    transform: "translateX(100%)",
    width: "clamp(200px, 25vw, 300px)",
    minWidth: "200px"
});
document.body.appendChild(sidebar);

// 사이드 진입 감지 zone
const hoverZone = document.createElement("div");
Object.assign(hoverZone.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "30px",
    height: "90%",
    zIndex: "9999",
    background: "transparent",
});
hoverZone.id = "hover-zone";
document.body.appendChild(hoverZone);

// 사이드바 상태
let sidebarPinned = false;

// 마우스 hover → 슬쩍 보여주기
hoverZone.addEventListener("mouseenter", () => {
    if (!sidebarPinned) {
        const previewAmount = 30;
        sidebar.style.transform = `translateX(${300 - previewAmount}px)`;
    }
});

// 클릭 → 완전히 펼침 + 고정
hoverZone.addEventListener("click", () => {
    sidebarPinned = true;
    sidebar.style.transform = "translateX(0)";
    hoverZone.style.zIndex = "1";
});

// 마우스가 완전히 벗어났을 때 → 자동 숨김
document.addEventListener("mousemove", (e) => {
    const fromSidebar = sidebar.getBoundingClientRect();
    const fromZone = hoverZone.getBoundingClientRect();

    const isInSidebar =
        e.clientX >= fromSidebar.left && e.clientX <= fromSidebar.right;
    const isInZone =
        e.clientX >= fromZone.left && e.clientX <= fromZone.right;

    if (!isInSidebar && !isInZone && !sidebarPinned) {
        sidebar.style.transform = "translateX(100%)";
    }
});

// 외부 클릭 시 닫힘
document.addEventListener("click", (e) => {
    const inSidebar = sidebar.contains(e.target);
    const inZone = hoverZone.contains(e.target);

    if (!inSidebar && !inZone && sidebarPinned) {
        sidebar.style.transform = "translateX(100%)";
        sidebarPinned = false;
        hoverZone.style.zIndex = "9999";
    }
});

// iframe → content.js 메시지 수신 (닫기 요청)
window.addEventListener("message", (event) => {
    if (event.data?.action === "closeSidebar") {
        sidebar.style.transform = "translateX(100%)";
        sidebarPinned = false;
        hoverZone.style.zIndex = "9999";
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
