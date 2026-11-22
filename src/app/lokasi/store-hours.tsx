"use client";

import { useSyncExternalStore } from "react";
import {
  formatClock,
  timezoneLabel,
  type StoreClosure,
  type StoreDay,
  type StoreStatus,
} from "@/lib/site";

const DAY_MS = 86_400_000;
// How far ahead to look for the next opening, so a run of special closures
// right after a closed day still finds one.
const LOOKAHEAD_DAYS = 21;

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

/** Weekday, minutes after midnight and YYYY-MM-DD in the store's time zone. */
function zonedTime(epochMs: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(epochMs));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    weekday: values.weekday,
    minutes: Number(values.hour) * 60 + Number(values.minute),
    date: `${values.year}-${values.month}-${values.day}`,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function StoreHours({
  schedule,
  closures,
  timezone,
  initialStatus,
}: {
  schedule: StoreDay[];
  closures: StoreClosure[];
  timezone: string;
  /** Server-side status, shown until the browser computes its own. */
  initialStatus: StoreStatus | null;
}) {
  const timestamp = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);
  const zone = timezoneLabel(timezone);
  const closureByDate = new Map(closures.map((closure) => [closure.date, closure]));

  const now = timestamp === null ? null : zonedTime(timestamp * 60_000, timezone);
  const today = now ? schedule.find(({ weekday }) => weekday === now.weekday) : undefined;
  const todayClosure = now ? closureByDate.get(now.date) : undefined;
  const isOpen =
    now !== null &&
    today !== undefined &&
    !today.closed &&
    !todayClosure &&
    now.minutes >= today.opensAt &&
    now.minutes < today.closesAt;

  let nextOpening: string | null = null;
  if (now && timestamp !== null && !isOpen) {
    for (let offset = 0; offset < LOOKAHEAD_DAYS; offset += 1) {
      const day = offset === 0 ? now : zonedTime(timestamp * 60_000 + offset * DAY_MS, timezone);
      const entry = schedule.find(({ weekday }) => weekday === day.weekday);
      if (!entry || entry.closed || closureByDate.has(day.date)) continue;
      if (offset > 0 || now.minutes < entry.opensAt) {
        const when = offset === 0 ? "hari ini" : offset === 1 ? "besok" : offset < 7 ? entry.day : formatDate(day.date);
        nextOpening = `${when} pukul ${formatClock(entry.opensAt)}`;
        break;
      }
    }
  }

  // Before hydration, fall back to the API's status (if any).
  const shownOpen = now ? isOpen : initialStatus?.isOpen;
  const statusLabel =
    shownOpen === undefined ? "Memeriksa jam buka..." : shownOpen ? "Buka sekarang" : "Tutup sekarang";
  const upcomingClosures = now ? closures.filter((closure) => closure.date >= now.date) : closures;

  return (
    <section aria-labelledby="jam-buka" className="mt-10 sm:mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink sm:text-2xl" id="jam-buka">
          Jam buka
        </h2>
        {zone && <p className="text-sm text-muted">Waktu setempat ({zone})</p>}
      </div>

      <div
        aria-live="polite"
        className={`mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-3 ${
          shownOpen === undefined
            ? "border-line bg-surface text-body"
            : shownOpen
              ? "border-success/25 bg-success-tint text-success"
              : "border-danger/20 bg-danger-tint text-danger"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          {shownOpen !== undefined && (
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${shownOpen ? "bg-success-dot" : "bg-danger-dot"}`}
            />
          )}
          {statusLabel}
        </span>
        {todayClosure && (
          <span className="text-sm">Libur hari ini{todayClosure.reason ? `: ${todayClosure.reason}` : ""}.</span>
        )}
        {now && !isOpen && nextOpening && <span className="text-sm">Buka lagi {nextOpening}</span>}
        {now && isOpen && today && !today.closed && (
          <span className="text-sm">Hari ini sampai pukul {formatClock(today.closesAt)}</span>
        )}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {schedule.map((entry) => {
          const isToday = now?.weekday === entry.weekday;
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
              <p className={`mt-2 text-sm tabular-nums ${entry.closed ? "font-medium text-danger" : "text-body"}`}>
                {entry.closed ? "Tutup" : `${formatClock(entry.opensAt)}–${formatClock(entry.closesAt)}`}
              </p>
            </li>
          );
        })}
      </ul>

      {upcomingClosures.length > 0 && (
        <div className="mt-6 rounded-2xl border border-notice-line bg-notice-tint p-4">
          <h3 className="text-sm font-semibold text-ink">Libur khusus</h3>
          <ul className="mt-2 space-y-1 text-sm text-notice">
            {upcomingClosures.map((closure) => (
              <li key={closure.date}>
                {formatDate(closure.date)}: tutup{closure.reason ? ` (${closure.reason})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
