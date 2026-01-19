export function downloadFile(url: string, mode: "view" | "download", filename?: string) {
    if (!url) return;

    if (mode === "view") {
        window.open(url, "_blank" );
    } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
} 