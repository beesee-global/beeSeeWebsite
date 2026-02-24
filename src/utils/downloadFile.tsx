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

export async function handleDownloadAttachment(
  file: { attachment_url: string; name: string }
) {
  const response = await fetch(file.attachment_url);
  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadFileDesktop(
  url: string,
  options?: {
    filename?: string;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }
) {
  if (!url) return;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch file");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;

    const resolvedFilename =
      options?.filename || url.split("/").pop() || "file";

    link.download = resolvedFilename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);

    options?.onSuccess?.();
  } catch (error) {
    console.error("Download error:", error);
    options?.onError?.(error);
  }
}
