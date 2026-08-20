const productCutouts: Record<string, string> = {
  "LAP-001": "/productHub/LaptopFusion.png",
  "LAP-002": "/productHub/LaptopDuos.png",
  "LAP-003": "/productHub/LaptopElite.png",
  "LAP-004": "/productHub/LaptopPro.png",
  "TAB-001": "/productHub/TabletBeepad.png",
  "WAT-001": "/productHub/S7Watch.png",
  "WAT-002": "/productHub/M7Watch.png",
};

/**
 * Curated transparent cutouts for dark catalogue surfaces.
 * The API gallery remains the source of truth for full product galleries.
 */
export const getProductCutout = (pid?: string | null) => {
  if (!pid) return undefined;
  return productCutouts[pid.toUpperCase()];
};
