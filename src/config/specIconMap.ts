// Central mapping from normalized spec keys to lucide-react icon names
export const specIconMap: Record<string, string> = {
  cpu: 'Cpu',
  processor: 'Cpu',
  ram: 'MemoryStick',
  storage: 'HardDrive',
  ssd: 'HardDrive',
  hdd: 'HardDrive',
  display: 'Monitor',
  screen: 'Monitor',
  size: 'Monitor',
  battery: 'Battery',
  'battery life': 'Battery',
  sensors: 'Heart',
  spo2: 'Heart',
  ecg: 'Heart',
  heart: 'Heart',
  wifi: 'Wifi',
  bluetooth: 'Wifi',
  connectivity: 'Wifi',
  resolution: 'Image',
  refresh_rate: 'RefreshCw',
  refresh: 'RefreshCw',
  panel_type: 'Layers',
  panel: 'Layers',
  touchscreen: 'Fingerprint',
  touch: 'Fingerprint',
  gpu: 'Gpu',
  graphics: 'Chip',
  os: 'Cpu',
  smart_features: 'Smartphone',
  laptop: 'Laptop',

};

export function getIconNameForSpec(key?: string | null) {
  if (!key) return 'HelpCircle';
  const k = key.toString().toLowerCase().trim();
  // Normalize common patterns
  const normalized = k.replace(/[^a-z0-9_ ]/g, '').replace(/\s+/g, '_');
  if (specIconMap[normalized]) return specIconMap[normalized];

  // try partial matches
  for (const token of Object.keys(specIconMap)) {
    if (normalized.includes(token)) return specIconMap[token];
  }

  return 'HelpCircle';
}
