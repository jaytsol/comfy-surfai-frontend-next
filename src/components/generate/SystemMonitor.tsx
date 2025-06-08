import React from "react";
import {
  CrystoolsMonitorData,
  SystemMonitorProps,
} from "@/interfaces/system-monitor.interface";

/**
 * 시스템 리소스 사용량을 표시하는 컴포넌트
 * CPU, RAM, GPU, VRAM 등의 사용량을 실시간으로 보여줍니다.
 */
const SystemMonitor: React.FC<SystemMonitorProps> = ({
  data,
  className = "",
}) => {
  if (!data) return null;

  return (
    <div
      className={`p-4 border border-dashed border-sky-300 rounded-md bg-sky-50 ${className}`}
    >
      <h3 className="text-md font-semibold text-sky-700 mb-3">
        🖥️ 시스템 리소스 현황
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-gray-700">
        <div>
          CPU:{" "}
          <span className="font-medium text-sky-600">
            {data.cpu_utilization?.toFixed(1)}%
          </span>
        </div>
        <div>
          RAM:{" "}
          <span className="font-medium text-sky-600">
            {data.ram_used_percent?.toFixed(1)}%
          </span>{" "}
          ({(data.ram_used / 1024 ** 3).toFixed(1)} GB /{" "}
          {(data.ram_total / 1024 ** 3).toFixed(1)} GB)
        </div>

        {data.gpus?.map((gpu, index) => (
          <React.Fragment key={index}>
            {data.gpus.length > 1 && (
              <div className="mt-1 col-span-full text-xs font-semibold text-gray-500">
                GPU {index}
              </div>
            )}
            <div>
              GPU 사용률:{" "}
              <span className="font-medium text-sky-600">
                {gpu.gpu_utilization?.toFixed(1)}%
              </span>
            </div>
            <div>
              VRAM 사용률:{" "}
              <span className="font-medium text-sky-600">
                {gpu.vram_used_percent?.toFixed(1)}%
              </span>{" "}
              ({(gpu.vram_used / 1024 ** 3).toFixed(1)} GB /{" "}
              {(gpu.vram_total / 1024 ** 3).toFixed(1)} GB)
            </div>
            <div>
              GPU 온도:{" "}
              <span className="font-medium text-sky-600">
                {gpu.gpu_temperature}°C
              </span>
            </div>
          </React.Fragment>
        ))}

        {data.hdd_used_percent !== undefined && data.hdd_used_percent > -1 && (
          <div>
            HDD:{" "}
            <span className="font-medium text-sky-600">
              {data.hdd_used_percent?.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitor;
