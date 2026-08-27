import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Check, Move, RotateCcw, SlidersHorizontal, X, ZoomIn } from "lucide-react";

type ImageCropAdjustDialogProps = {
  file: File | null;
  onCancel: () => void;
  onApply: (file: File) => void;
  aspectRatio?: number;
};

const OUTPUT_WIDTH = 1200;

/** A dependency-free cropper for product photos. It exports an optimized File. */
const ImageCropAdjustDialog = ({
  file,
  onCancel,
  onApply,
  aspectRatio = 4 / 3,
}: ImageCropAdjustDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const outputHeight = Math.round(OUTPUT_WIDTH / aspectRatio);

  const reset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!file) return;

    setImageReady(false);
    reset();
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setImageReady(true);
    };
    image.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
      imageRef.current = null;
    };
  }, [file, reset]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageReady) return;

    canvas.width = OUTPUT_WIDTH;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#111827";
    context.fillRect(0, 0, OUTPUT_WIDTH, outputHeight);
    const angle = (rotation * Math.PI) / 180;
    const rotatedWidth = Math.abs(image.width * Math.cos(angle)) + Math.abs(image.height * Math.sin(angle));
    const rotatedHeight = Math.abs(image.width * Math.sin(angle)) + Math.abs(image.height * Math.cos(angle));
    // Start in "fit" mode so square, portrait, and wide product photos are
    // fully visible in the 4:3 output. Higher zoom values intentionally crop.
    const baseScale = Math.min(OUTPUT_WIDTH / rotatedWidth, outputHeight / rotatedHeight);
    const scale = baseScale * zoom;

    context.save();
    context.translate(OUTPUT_WIDTH / 2 + offset.x, outputHeight / 2 + offset.y);
    context.rotate(angle);
    context.drawImage(image, (-image.width * scale) / 2, (-image.height * scale) / 2, image.width * scale, image.height * scale);
    context.restore();
  }, [imageReady, offset, outputHeight, rotation, zoom]);

  useEffect(() => {
    draw();
  }, [draw]);

  const apply = () => {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const extension = type === "image/png" ? "png" : "jpg";
    const filename = `${file.name.replace(/\.[^.]+$/, "")}-edited.${extension}`;
    canvas.toBlob((blob) => {
      if (blob) onApply(new File([blob], filename, { type }));
    }, type, 0.92);
  };

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const scale = OUTPUT_WIDTH / canvas.getBoundingClientRect().width;
    dragStart.current = {
      x: event.clientX * scale,
      y: event.clientY * scale,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const start = dragStart.current;
    const canvas = canvasRef.current;
    if (!start || !canvas) return;
    const scale = OUTPUT_WIDTH / canvas.getBoundingClientRect().width;
    setOffset({
      x: start.offsetX + event.clientX * scale - start.x,
      y: start.offsetY + event.clientY * scale - start.y,
    });
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Crop and adjust image">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-700 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crop and adjust image</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Drag the image to position it, then zoom or rotate it as needed.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white" aria-label="Close image editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <canvas
            ref={canvasRef}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={() => { dragStart.current = null; }}
            onPointerCancel={() => { dragStart.current = null; }}
            className="max-h-[52vh] w-full touch-none cursor-grab rounded-xl bg-gray-900 object-contain active:cursor-grabbing"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              <span className="mb-2 flex items-center gap-2"><ZoomIn className="h-4 w-4" /> Zoom: {zoom.toFixed(1)}×</span>
              <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-[#FCD000]" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              <span className="mb-2 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Rotate: {rotation}°</span>
              <input type="range" min="-180" max="180" step="1" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="w-full accent-[#FCD000]" />
            </label>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Move className="h-4 w-4" /> The visible area will be saved as a 4:3 product image.</p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:justify-between sm:p-5">
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"><RotateCcw className="h-4 w-4" /> Reset adjustments</button>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button type="button" onClick={apply} disabled={!imageReady} className="inline-flex items-center gap-2 rounded-lg bg-[#FCD000] px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-[#e8be00] disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-4 w-4" /> Use this image</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropAdjustDialog;
