'use client';

import { useMemo, useState } from 'react';
import { Ban, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentStatus } from '@/types';
import type { AppointmentResponse, BlockedTimeResponse, BusinessHoursResponse, BusinessResponse } from '@/types';
import {
  addDaysKey,
  dayKeyLabel,
  hourLabel,
  minutesToTimeString,
  startOfWeekKey,
  timeStringToMinutes,
  todayKeyInZone,
  weekRangeLabel,
  zonedDateInfo,
} from '@/lib/calendar';

const HOUR_HEIGHT = 48; // px per hour
const SNAP = 30; // minutes
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;

interface WeeklyCalendarProps {
  business: BusinessResponse;
  appointments: AppointmentResponse[];
  blocks: BlockedTimeResponse[];
  hours?: BusinessHoursResponse[];
  onSelectAppointment: (appt: AppointmentResponse) => void;
  onSelectBlock: (block: BlockedTimeResponse) => void;
  onBlockSlot: (dateKey: string, startMinutes: number) => void;
  onAddBlock: () => void;
}

export default function WeeklyCalendar({
  business,
  appointments,
  blocks,
  hours,
  onSelectAppointment,
  onSelectBlock,
  onBlockSlot,
  onAddBlock,
}: WeeklyCalendarProps) {
  const tz = business.timeZoneId;
  const todayKey = todayKeyInZone(tz);
  const [weekStart, setWeekStart] = useState(() => startOfWeekKey(todayKey));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysKey(weekStart, i)),
    [weekStart],
  );

  // Appointments shown on the calendar (cancelled ones are hidden).
  const shownAppts = useMemo(
    () => appointments.filter((a) => a.status !== AppointmentStatus.Cancelled),
    [appointments],
  );

  // Vertical range: business hours, widened to fit any event that lands outside them.
  const [startHour, endHour] = useMemo(() => {
    let min = DEFAULT_START_HOUR;
    let max = DEFAULT_END_HOUR;

    const open = (hours ?? []).filter((h) => h.isOpen);
    if (open.length > 0) {
      min = Math.min(...open.map((h) => Math.floor(timeStringToMinutes(h.open) / 60)));
      max = Math.max(...open.map((h) => Math.ceil(timeStringToMinutes(h.close) / 60)));
    }

    for (const a of shownAppts) {
      const { minutes } = zonedDateInfo(a.startDateTime, tz);
      const endMin = minutes + (a.durationInMinutes || 30);
      min = Math.min(min, Math.floor(minutes / 60));
      max = Math.max(max, Math.ceil(endMin / 60));
    }
    for (const b of blocks) {
      const s = zonedDateInfo(b.startDateTime, tz);
      const e = zonedDateInfo(b.endDateTime, tz);
      min = Math.min(min, Math.floor(s.minutes / 60));
      max = Math.max(max, Math.ceil(e.minutes / 60));
    }

    return [Math.max(0, Math.min(min, 23)), Math.min(24, Math.max(max, min + 1))];
  }, [hours, shownAppts, blocks, tz]);

  const hourMarks = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );
  const bodyHeight = (endHour - startHour) * HOUR_HEIGHT;

  const topFor = (minutes: number) => (minutes / 60 - startHour) * HOUR_HEIGHT;

  const handleColumnClick = (dateKey: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const raw = startHour * 60 + (y / HOUR_HEIGHT) * 60;
    const snapped = Math.round(raw / SNAP) * SNAP;
    const clamped = Math.max(startHour * 60, Math.min(endHour * 60 - SNAP, snapped));
    onBlockSlot(dateKey, clamped);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h3 className="text-base font-bold text-foreground">{weekRangeLabel(weekStart)}</h3>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={onAddBlock}
            className="mr-1 rounded-xl text-sm font-semibold"
          >
            <Plus className="size-4" />
            Block time
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setWeekStart(startOfWeekKey(todayKey))}
            className="rounded-xl text-sm font-semibold"
          >
            Today
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setWeekStart(addDaysKey(weekStart, -7))}
            className="rounded-xl"
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setWeekStart(addDaysKey(weekStart, 7))}
            className="rounded-xl"
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Day headers */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border">
            <div />
            {days.map((dayKey) => {
              const { weekday, day } = dayKeyLabel(dayKey);
              const isToday = dayKey === todayKey;
              return (
                <div key={dayKey} className="border-l border-border px-2 py-2 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {weekday}
                  </p>
                  <p
                    className={
                      isToday
                        ? 'mx-auto mt-0.5 grid size-7 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground'
                        : 'mt-0.5 text-sm font-bold text-foreground'
                    }
                  >
                    {day}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            {/* Hour gutter */}
            <div className="relative" style={{ height: bodyHeight }}>
              {hourMarks.map((h) => (
                <div
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
                  style={{ top: (h - startHour) * HOUR_HEIGHT }}
                >
                  {hourLabel(h)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((dayKey) => {
              const dayAppts = shownAppts.filter(
                (a) => zonedDateInfo(a.startDateTime, tz).dateKey === dayKey,
              );
              const dayBlocks = blocks.filter(
                (b) => zonedDateInfo(b.startDateTime, tz).dateKey === dayKey,
              );

              return (
                <div
                  key={dayKey}
                  className="relative cursor-pointer border-l border-border"
                  style={{ height: bodyHeight }}
                  onClick={(e) => handleColumnClick(dayKey, e)}
                >
                  {/* Hour gridlines */}
                  {hourMarks.map((h) => (
                    <div
                      key={h}
                      className="pointer-events-none absolute inset-x-0 border-t border-border/50"
                      style={{ top: (h - startHour) * HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Blocked times */}
                  {dayBlocks.map((b) => {
                    const start = zonedDateInfo(b.startDateTime, tz);
                    const end = zonedDateInfo(b.endDateTime, tz);
                    const height = Math.max(end.minutes - start.minutes, 20) * (HOUR_HEIGHT / 60);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBlock(b);
                        }}
                        className="absolute inset-x-1 z-10 overflow-hidden rounded-md border border-dashed border-muted-foreground/40 bg-muted/80 px-1.5 py-1 text-left transition-colors hover:bg-muted"
                        style={{ top: topFor(start.minutes), height }}
                      >
                        <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-muted-foreground">
                          <Ban className="size-3 shrink-0" />
                          {b.reason || 'Blocked'}
                        </p>
                      </button>
                    );
                  })}

                  {/* Appointments */}
                  {dayAppts.map((a) => {
                    const { minutes } = zonedDateInfo(a.startDateTime, tz);
                    const height = Math.max(a.durationInMinutes || 30, 24) * (HOUR_HEIGHT / 60);
                    const pending = a.status === AppointmentStatus.Pending;
                    const completed = a.status === AppointmentStatus.Completed;

                    const tone = pending
                      ? 'border-dashed border-muted-foreground/50 bg-muted text-muted-foreground'
                      : completed
                        ? 'border-border bg-secondary text-secondary-foreground'
                        : 'border-primary bg-primary text-primary-foreground';

                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(a);
                        }}
                        className={`absolute inset-x-1 z-20 overflow-hidden rounded-md border px-1.5 py-1 text-left shadow-sm transition-transform hover:scale-[1.02] ${tone}`}
                        style={{ top: topFor(minutes), height }}
                      >
                        <p className="truncate text-[11px] font-bold leading-tight">{a.serviceName}</p>
                        <p className="truncate text-[10px] leading-tight opacity-90">{a.clientName}</p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border p-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-primary" /> Confirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-dashed border-muted-foreground/50 bg-muted" /> Pending
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-secondary" /> Completed
        </span>
        <span className="ml-auto hidden sm:block">Click an empty slot to block time</span>
      </div>
    </div>
  );
}
