// 토글 버튼 생성
const toggleBtn = document.createElement("button");
toggleBtn.innerText = "📃";
Object.assign(toggleBtn.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    zIndex: "10000",
    padding: "8px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    cursor: "pointer"
});
document.body.appendChild(toggleBtn);

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
    transform: "translateX(100%)"
});
document.body.appendChild(sidebar);

// 토글 동작
let isSidebarOpen = false;
toggleBtn.addEventListener("click", () => {
    isSidebarOpen = !isSidebarOpen;
    sidebar.style.transform = isSidebarOpen ? "translateX(0)" : "translateX(100%)";
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
