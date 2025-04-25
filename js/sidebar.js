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
            handle.style.marginRight = "0.6em";
            handle.classList.add("drag-handle");

            // 썸네일
            const img = document.createElement("img");
            img.src = item.thumbnail || "https://via.placeholder.com/110x68?text=No+Thumbnail";
            img.alt = "썸네일";
            img.style.width = "110px";
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
            contentBox.style.gap = "12px";
            contentBox.style.flexGrow = "1";
            contentBox.style.maxWidth = "215px";
            contentBox.appendChild(img);
            contentBox.appendChild(link);

            li.appendChild(handle);
            li.appendChild(contentBox);
            li.appendChild(removeBtn);

            // 드래그 이벤트
            li.addEventListener("dragstart", () => {
                dragSrcIndex = index;
                li.style.opacity = "0.5";
            });

            li.addEventListener("dragend", () => {
                li.style.opacity = "1";
            });

            li.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            li.addEventListener("drop", () => {
                if (dragSrcIndex === null || dragSrcIndex === index) return;
                const moved = playlist.splice(dragSrcIndex, 1)[0];
                playlist.splice(index, 0, moved);
                chrome.storage.local.set({ playlist }, () => {
                    loadPlaylist();
                });
            });

            ul.appendChild(li);
        });
    });
}
