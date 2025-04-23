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
    transform: "translateX(295px)",
    pointerEvents: "none", // 슬쩍일 때는 클릭 안되게
});
document.body.appendChild(sidebar);

// 감지존 생성
const edgeZone = document.createElement("div");
Object.assign(edgeZone.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: "20px",
    height: "100%",
    zIndex: "9998",
    cursor: "pointer"
});
document.body.appendChild(edgeZone);

let isSidebarOpen = false;
let isHovering = false;

// 마우스가 감지존에 들어오면 살짝 보여주기
edgeZone.addEventListener("mouseenter", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(270px)";
        sidebar.style.pointerEvents = "auto";
        isHovering = true;
    }
});

// 마우스가 감지존을 벗어나면 다시 숨기기
edgeZone.addEventListener("mouseleave", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(295px)";
        sidebar.style.pointerEvents = "none";
        isHovering = false;
    }
});

// 감지존을 클릭하면 완전히 열기
edgeZone.addEventListener("click", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(0)";
        sidebar.style.pointerEvents = "auto";
        isSidebarOpen = true;
    }
});

// 사이드바 살짝 나온 상태에서 직접 클릭해도 완전히 열리게
sidebar.addEventListener("click", () => {
    if (!isSidebarOpen) {
        sidebar.style.transform = "translateX(0)";
        sidebar.style.pointerEvents = "auto";
        isSidebarOpen = true;
    }
});

// 바깥 클릭 시 닫기
document.addEventListener("click", (e) => {
    const isInsideSidebar = e.clientX > window.innerWidth - 300;
    if (
        isSidebarOpen &&
        !isInsideSidebar &&
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
