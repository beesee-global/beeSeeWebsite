import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
// @ts-ignore: Vite resolves the PDF.js worker URL at build time.
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore: Vite resolves the PDF.js worker URL at build time.
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type PdfDocument = {
  getPage: (pageNumber: number) => Promise<any>;
  destroy: () => Promise<void>;
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

type PdfCacheEntry = {
  promise: Promise<PdfDocument>;
  document: PdfDocument | null;
};

const pdfDocumentCache = new Map<string, PdfCacheEntry>();

const getCachedPdfDocument = (url: string) => {
  const cached = pdfDocumentCache.get(url);
  if (cached) return cached.promise;

  const loadingTask = pdfjsLib.getDocument({ url });
  let entry: PdfCacheEntry;
  entry = {
    document: null,
    promise: loadingTask.promise.then((document: PdfDocument) => {
      entry.document = document;
      return document;
    }).catch((error: unknown) => {
      if (pdfDocumentCache.get(url) === entry) pdfDocumentCache.delete(url);
      throw error;
    }),
  };

  pdfDocumentCache.set(url, entry);
  return entry.promise;
};

export const preloadPdfPreview = (url: string) => {
  if (!url) return;
  void getCachedPdfDocument(url).catch(() => undefined);
};

export const clearPdfPreviewCache = () => {
  pdfDocumentCache.forEach(({ document }) => {
    if (document) void document.destroy();
  });
  pdfDocumentCache.clear();
};

const PdfPagePreview: React.FC<{ url: string; fallbackUrl?: string; title: string; className?: string }> = ({
  url,
  fallbackUrl,
  title,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(url));

  useEffect(() => {
    setIsLoading(Boolean(url));
    setPreviewError(false);

    let disposed = false;
    let frameId: number | null = null;
    let renderQueued = false;
    let isRendering = false;
    let renderTask: PdfRenderTask | null = null;
    let pdfDocument: PdfDocument | null = null;
    let pdfPage: any = null;
    let resizeObserver: ResizeObserver | null = null;

    const cancelRenderTask = () => {
      renderTask?.cancel();
      renderTask = null;
    };

    const renderPage = async () => {
      if (disposed || isRendering) {
        renderQueued = true;
        return;
      }

      const canvas = canvasRef.current;
      const container = canvas?.parentElement;
      if (!canvas || !container) return;

      isRendering = true;
      renderQueued = false;
      let completed = false;

      try {
        if (!pdfDocument) {
          try {
            pdfDocument = await getCachedPdfDocument(url);
          } catch (primaryError) {
            if (!fallbackUrl || fallbackUrl === url) throw primaryError;
            pdfDocument = await getCachedPdfDocument(fallbackUrl);
          }
          if (disposed) return;
        }

        if (!pdfPage) {
          pdfPage = await pdfDocument.getPage(1);
          if (disposed) return;
        }

        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const availableWidth = Math.max(container.clientWidth - 16, 1);
        const availableHeight = Math.max(container.clientHeight - 16, 1);
        const scale = Math.min(
          availableWidth / baseViewport.width,
          availableHeight / baseViewport.height,
        );
        const viewport = pdfPage.getViewport({ scale });
        const devicePixelRatio = window.devicePixelRatio || 1;

        // Render away from the visible canvas. The current preview remains
        // visible until the replacement page is complete.
        const nextCanvas = document.createElement("canvas");
        nextCanvas.width = Math.ceil(viewport.width * devicePixelRatio);
        nextCanvas.height = Math.ceil(viewport.height * devicePixelRatio);
        const nextContext = nextCanvas.getContext("2d");
        if (!nextContext) throw new Error("Canvas rendering is unavailable.");

        nextContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        const currentRenderTask = pdfPage.render({
          canvasContext: nextContext,
          viewport,
        });
        renderTask = currentRenderTask;
        await currentRenderTask.promise;
        completed = true;

        if (disposed) return;

        const visibleContext = canvas.getContext("2d");
        if (!visibleContext) throw new Error("Canvas rendering is unavailable.");

        canvas.width = nextCanvas.width;
        canvas.height = nextCanvas.height;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        visibleContext.setTransform(1, 0, 0, 1, 0, 0);
        visibleContext.clearRect(0, 0, canvas.width, canvas.height);
        visibleContext.drawImage(nextCanvas, 0, 0);
        setPreviewError(false);
        setIsLoading(false);
      } catch (error) {
        if (!disposed && !completed && !(error instanceof Error && error.name === "RenderingCancelledException")) {
          console.error("Failed to render product brochure preview:", error);
          setPreviewError(true);
          setIsLoading(false);
        }
      } finally {
        renderTask = null;
        isRendering = false;
        if (!disposed && renderQueued) scheduleRender();
      }
    };

    const scheduleRender = () => {
      if (disposed) return;
      renderQueued = true;
      if (frameId !== null) return;

      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (renderQueued) void renderPage();
      });
    };

    scheduleRender();

    const previewContainer = canvasRef.current?.parentElement;
    if (previewContainer && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleRender);
      resizeObserver.observe(previewContainer);
    }

    return () => {
      disposed = true;
      renderQueued = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      resizeObserver?.disconnect();
      cancelRenderTask();
      pdfDocument = null;
      pdfPage = null;
    };
  }, [url, fallbackUrl]);

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 ${className}`}>
      <canvas ref={canvasRef} aria-label={title} className="block max-h-full max-w-full object-contain" />
      {isLoading && !previewError && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gray-950/80 px-4 text-center"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#fcd000]" aria-hidden="true" />
          <span className="text-sm text-gray-200">Loading brochure preview...</span>
        </div>
      )}
      {previewError && (
        <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Preview unavailable
        </span>
      )}
    </div>
  );
};

export default PdfPagePreview;
