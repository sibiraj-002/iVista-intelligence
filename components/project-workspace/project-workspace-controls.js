"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { projectToolNavigation } from "@/components/layout/navigation";
import {
  dateRangeOptions,
  formatDateInput,
  getDefaultDateRange,
} from "@/utils/date-range";
import { cn } from "@/utils/cn";

function getParamsWithUpdates(searchParams, updates) {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  return params;
}

function getToolHref(href, searchParams) {
  const params = new URLSearchParams(searchParams.toString());
  const query = params.toString();

  return query ? `${href}?${query}` : href;
}

function formatDisplayDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getRangeLabel(value) {
  return dateRangeOptions.find((option) => option.value === value)?.label || "Date range";
}

function parseDate(value) {
  return new Date(`${value}T00:00:00`);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);

  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
      value: formatDateInput(date),
    };
  });
}

function isBetween(value, startDate, endDate) {
  return value > startDate && value < endDate;
}

export function ProjectWorkspaceControls({
  isLoadingProjects = false,
  metaLabel,
  metaValue,
  projects,
  selectedProjectId,
  showDateRange = true,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "this_month";
  const currentRange = getDefaultDateRange(range);
  const startDate = searchParams.get("startDate") || currentRange.startDate;
  const endDate = searchParams.get("endDate") || currentRange.endDate;
  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draftRange, setDraftRange] = useState(range);
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(parseDate(startDate).getFullYear(), parseDate(startDate).getMonth(), 1)
  );
  const dateButtonLabel = useMemo(
    () => `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`,
    [endDate, startDate]
  );

  function replaceParams(updates) {
    const params = getParamsWithUpdates(searchParams, updates);

    router.replace(`${pathname}?${params.toString()}`);
    window.dispatchEvent(
      new CustomEvent("workspace-search-change", {
        detail: `?${params.toString()}`,
      })
    );
  }

  function updateDraftRange(value) {
    const nextRange = getDefaultDateRange(value);

    setDraftRange(value);
    setDraftStartDate(nextRange.startDate);
    setDraftEndDate(nextRange.endDate);
    setVisibleMonth(
      new Date(
        parseDate(nextRange.startDate).getFullYear(),
        parseDate(nextRange.startDate).getMonth(),
        1
      )
    );
  }

  function cancelDateSelection() {
    setDraftRange(range);
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setVisibleMonth(
      new Date(parseDate(startDate).getFullYear(), parseDate(startDate).getMonth(), 1)
    );
    setIsPickerOpen(false);
  }

  function applyDateSelection() {
    replaceParams({
      endDate: draftEndDate,
      range: draftRange,
      startDate: draftStartDate,
    });
    setIsPickerOpen(false);
  }

  function handleDateClick(value) {
    if (!draftStartDate || draftEndDate) {
      setDraftRange("custom");
      setDraftStartDate(value);
      setDraftEndDate("");
      return;
    }

    setDraftRange("custom");

    if (value < draftStartDate) {
      setDraftEndDate(draftStartDate);
      setDraftStartDate(value);
      return;
    }

    setDraftEndDate(value);
  }

  return (
    <CardShell>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              {isLoadingProjects
                ? "Loading clients..."
                : selectedProject?.name || "Choose a client from the sidebar"}
            </h2>
            {metaLabel && metaValue ? (
              <span className="inline-flex w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                {metaLabel}: {metaValue}
              </span>
            ) : null}
          </div>
        </div>

        {showDateRange ? (
          <div className="relative">
          <button
            className="flex h-12 min-w-80 items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 text-left text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
            onClick={() => setIsPickerOpen((current) => !current)}
            type="button"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {getRangeLabel(range)}
              </span>
              {dateButtonLabel}
            </span>
            <CalendarDays className="h-4 w-4 text-zinc-400" />
          </button>

          {isPickerOpen ? (
            <div className="absolute right-0 top-14 z-50 w-[min(56rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
              <div className="grid md:grid-cols-[190px_1fr]">
                <div className="border-b border-zinc-100 bg-zinc-50/80 p-4 md:border-b-0 md:border-r">
                  {dateRangeOptions.map((option) => (
                    <button
                      className={cn(
                        "block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                        draftRange === option.value
                          ? "bg-white text-zinc-950 shadow-sm"
                          : "text-zinc-600 hover:bg-white hover:text-zinc-950"
                      )}
                      key={option.value}
                      onClick={() => updateDraftRange(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="grid border-b border-zinc-100 lg:grid-cols-2">
                    {[visibleMonth, addMonths(visibleMonth, 1)].map((month, monthIndex) => (
                      <div
                        className={cn(
                          "p-5",
                          monthIndex === 0 ? "lg:border-r lg:border-zinc-100" : ""
                        )}
                        key={month.toISOString()}
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                            onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
                            type="button"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <p className="text-base font-semibold text-zinc-950">
                            {getMonthLabel(month)}
                          </p>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                            onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                            type="button"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500">
                          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                            <div className="py-2" key={day}>
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 grid grid-cols-7 gap-y-1">
                          {getCalendarDays(month).map((day) => {
                            const isStart = day.value === draftStartDate;
                            const isEnd = day.value === draftEndDate;
                            const isSelected = isStart || isEnd;
                            const isInRange =
                              draftStartDate &&
                              draftEndDate &&
                              isBetween(day.value, draftStartDate, draftEndDate);

                            return (
                              <div
                                className={cn(
                                  "relative flex h-11 items-center justify-center",
                                  isInRange ? "bg-violet-50" : "",
                                  isStart && draftEndDate ? "rounded-l-full bg-violet-50" : "",
                                  isEnd && draftStartDate ? "rounded-r-full bg-violet-50" : ""
                                )}
                                key={day.value}
                              >
                                <button
                                  className={cn(
                                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all",
                                    isSelected
                                      ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                                      : "",
                                    !isSelected && day.isCurrentMonth
                                      ? "text-zinc-800 hover:bg-zinc-100"
                                      : "",
                                    !day.isCurrentMonth && !isSelected
                                      ? "text-zinc-300 hover:bg-zinc-50"
                                      : "",
                                    isInRange && !isSelected
                                      ? "text-violet-700 hover:bg-violet-100"
                                      : "",
                                    !draftEndDate && isStart
                                      ? "ring-4 ring-violet-100"
                                      : ""
                                  )}
                                  onClick={() => handleDateClick(day.value)}
                                  type="button"
                                >
                                  {day.date.getDate()}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-950">
                        {draftStartDate ? formatDisplayDate(draftStartDate) : "Start date"}
                      </div>
                      <span className="text-zinc-400">-</span>
                      <div className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-950">
                        {draftEndDate ? formatDisplayDate(draftEndDate) : "End date"}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                    <button
                      className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                      onClick={cancelDateSelection}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="h-10 rounded-xl bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                      disabled={!draftStartDate || !draftEndDate}
                      onClick={applyDateSelection}
                      type="button"
                    >
                      Apply
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
        {projectToolNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
              )}
              href={getToolHref(item.href, searchParams)}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </CardShell>
  );
}

function CardShell({ children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {children}
    </section>
  );
}
