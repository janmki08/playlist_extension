// 사이드바 iframe 생성
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
    transform: "translateX(295px)", // 처음에는 살짝만 보이게
    pointerEvents: "none" // 클릭 방지 (완전히 열릴 때만 가능)
});
document.body.appendChild(sidebar);

// 감지용 히든 핫존 생성
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

let isSidebarOpen = false;

// 마우스 진입 시 슬쩍 보여주기
edgeZone.addEventListener("mouseenter", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(270px)"; // 30px만 보이게
        sidebar.style.pointerEvents = "auto"; // 클릭 허용
    }
});

// 클릭 시 완전히 열기
edgeZone.addEventListener("click", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(0)";
        isSidebarOpen = true;
    }
});

// 사이드바 바깥 클릭 시 닫기
document.addEventListener("click", (e) => {
    if (
        isSidebarOpen &&
        !sidebar.contains(e.target) &&
        !edgeZone.contains(e.target)
    ) {
        sidebar.style.transform = "translateX(295px)";
        sidebar.style.pointerEvents = "none";
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
