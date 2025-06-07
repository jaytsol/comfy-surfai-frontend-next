export interface GpuInfo {
  gpu_utilization: number;
  gpu_temperature: number;
  vram_total: number;
  vram_used: number;
  vram_used_percent: number;
}

export interface CrystoolsMonitorData {
  cpu_utilization: number;
  ram_total: number;
  ram_used: number;
  ram_used_percent: number;
  hdd_total?: number;
  hdd_used?: number;
  hdd_used_percent?: number;
  device_type: string;
  gpus: GpuInfo[];
}

export interface SystemMonitorProps {
  data: CrystoolsMonitorData | null;
  className?: string;
}
