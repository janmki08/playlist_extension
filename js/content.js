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
