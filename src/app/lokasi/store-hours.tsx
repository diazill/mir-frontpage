"use client";

import { useSyncExternalStore } from "react";
import { formatClock, STORE_HOURS } from "@/lib/site";

const weekdayOrder = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function subscribeToClock(onChange: () => void) {
  const intervalId = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(intervalId);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 60_000);
}

function getServerClockSnapshot(): null {
  return null;
}

function getJakartaTime(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp * 60_000));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    weekday: values.weekday,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

export default function StoreHours() {
  const timestamp = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot,
  );
  const time = timestamp === null ? null : getJakartaTime(timestamp);
  const todayIndex = time ? weekdayOrder.indexOf(time.weekday) : -1;
  const today = STORE_HOURS.find(({ weekday }) => weekday === time?.weekday);
  const isOpen =
    time !== null &&
    today !== undefined &&
    !today.closed &&
    time.minutes >= today.opensAt &&
    time.minutes < today.closesAt;

  let nextOpening: string | null = null;
  if (time && todayIndex >= 0 && !isOpen) {
    for (let offset = 0; offset < weekdayOrder.length; offset += 1) {
      const weekday = weekdayOrder[(todayIndex + offset) % weekdayOrder.length];
      const nextDay = STORE_HOURS.find((entry) => entry.weekday === weekday);
      if (!nextDay || nextDay.closed) continue;

      if (offset > 0 || time.minutes < nextDay.opensAt) {
        nextOpening = `${
          offset === 0 ? "hari ini" : offset === 1 ? "besok" : nextDay.day
        } pukul ${formatClock(nextDay.opensAt)}`;
        break;
      }
    }
  }

  return (
    <section aria-labelledby="jam-buka" className="mt-10 sm:mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink sm:text-2xl" id="jam-buka">
          Jam buka
        </h2>
        <p className="text-sm text-muted">Waktu Indonesia Barat (WIB)</p>
      </div>

      <div
        aria-live="polite"
        className={`mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-3 ${
          timestamp === null
            ? "border-line bg-surface text-body"
            : isOpen
              ? "border-success/25 bg-success-tint text-success"
              : "border-danger/20 bg-danger-tint text-danger"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          {timestamp !== null && (
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${isOpen ? "bg-success-dot" : "bg-danger-dot"}`}
            />
          )}
          {timestamp === null
            ? "Memeriksa jam buka..."
            : isOpen
              ? "Buka sekarang"
              : "Tutup sekarang"}
        </span>
        {time && !isOpen && nextOpening && (
          <span className="text-sm">Buka lagi {nextOpening}</span>
        )}
        {time && isOpen && today && !today.closed && (
          <span className="text-sm">Hari ini sampai pukul {formatClock(today.closesAt)}</span>
        )}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STORE_HOURS.map((entry) => {
          const isToday = time?.weekday === entry.weekday;
          return (
            <li
              aria-current={isToday ? "date" : undefined}
              className={`rounded-2xl border p-4 ${
                isToday
                  ? "border-sage bg-brand-tint"
                  : entry.closed
                    ? "border-danger/20 bg-danger-tint/50"
                    : "border-line bg-surface"
              }`}
              key={entry.day}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-soft">{entry.day}</p>
                {isToday && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-sage">
                    Hari ini
                  </span>
                )}
              </div>
              <p
                className={`mt-2 text-sm tabular-nums ${
                  entry.closed ? "font-medium text-danger" : "text-body"
                }`}
              >
                {entry.closed
                  ? "Tutup"
                  : `${formatClock(entry.opensAt)}–${formatClock(entry.closesAt)}`}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
