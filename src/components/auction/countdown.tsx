"use client";

import { useEffect, useState } from "react";
import { formatTimeLeft } from "@/lib/utils";

export function CountdownTimer({ endDate }: { endDate: string | Date }) {
  const [timeLeft, setTimeLeft] = useState(
    new Date(endDate).getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(new Date(endDate).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const ended = timeLeft <= 0;

  if (ended) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        Ended
      </span>
    );
  }

  const seconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
      {hours > 0 && `${hours}h `}
      {minutes}m {secs}s left
    </span>
  );
}
