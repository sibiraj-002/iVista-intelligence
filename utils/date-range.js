export const dateRangeOptions = [
  {
    label: "Today",
    value: "today",
  },
  {
    label: "Yesterday",
    value: "yesterday",
  },
  {
    label: "This week",
    value: "this_week",
  },
  {
    label: "Last week",
    value: "last_week",
  },
  {
    label: "This month",
    value: "this_month",
  },
  {
    label: "Last month",
    value: "last_month",
  },
  {
    label: "Last 3 months",
    value: "last_3_months",
  },
  {
    label: "Last 6 months",
    value: "last_6_months",
  },
  {
    label: "This year",
    value: "this_year",
  },
  {
    label: "Last year",
    value: "last_year",
  },
  {
    label: "All time",
    value: "all_time",
  },
  {
    label: "Custom date",
    value: "custom",
  },
];

const rangeDays = {
  last_month: 30,
  last_3_months: 90,
  last_6_months: 180,
};

export function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay() || 7;

  result.setDate(result.getDate() - day + 1);

  return result;
}

export function getDefaultDateRange(range = "this_month", endOffsetDays = 0) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - endOffsetDays);
  const startDate = new Date(endDate);

  if (range === "today") {
    return {
      endDate: formatDateInput(endDate),
      startDate: formatDateInput(endDate),
    };
  }

  if (range === "yesterday") {
    startDate.setDate(endDate.getDate() - 1);

    return {
      endDate: formatDateInput(startDate),
      startDate: formatDateInput(startDate),
    };
  }

  if (range === "this_week") {
    return {
      endDate: formatDateInput(endDate),
      startDate: formatDateInput(startOfWeek(endDate)),
    };
  }

  if (range === "last_week") {
    const previousWeekEnd = startOfWeek(endDate);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
    const previousWeekStart = startOfWeek(previousWeekEnd);

    return {
      endDate: formatDateInput(previousWeekEnd),
      startDate: formatDateInput(previousWeekStart),
    };
  }

  if (range === "this_month") {
    return {
      endDate: formatDateInput(endDate),
      startDate: formatDateInput(
        new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      ),
    };
  }

  if (range === "this_year") {
    return {
      endDate: formatDateInput(endDate),
      startDate: formatDateInput(new Date(endDate.getFullYear(), 0, 1)),
    };
  }

  if (range === "last_year") {
    const year = endDate.getFullYear() - 1;

    return {
      endDate: formatDateInput(new Date(year, 11, 31)),
      startDate: formatDateInput(new Date(year, 0, 1)),
    };
  }

  if (range === "all_time") {
    return {
      endDate: formatDateInput(endDate),
      startDate: "2005-01-01",
    };
  }

  startDate.setDate(startDate.getDate() - (rangeDays[range] || rangeDays.last_month));

  return {
    endDate: formatDateInput(endDate),
    startDate: formatDateInput(startDate),
  };
}

export function resolveDateRange({
  endDate,
  endOffsetDays = 0,
  range = "this_month",
  startDate,
} = {}) {
  if (range === "custom" && startDate && endDate) {
    return {
      endDate,
      startDate,
    };
  }

  return getDefaultDateRange(range, endOffsetDays);
}

function addDays(value, days) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);

  return formatDateInput(date);
}

function getInclusiveDayCount(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const dayInMs = 24 * 60 * 60 * 1000;

  return Math.max(1, Math.round((end - start) / dayInMs) + 1);
}

export function getComparisonDateRanges(dateRange) {
  const dayCount = getInclusiveDayCount(dateRange.startDate, dateRange.endDate);
  const previousEndDate = addDays(dateRange.startDate, -1);
  const previousStartDate = addDays(previousEndDate, -dayCount + 1);
  const twoPeriodsAgoEndDate = addDays(previousStartDate, -1);
  const twoPeriodsAgoStartDate = addDays(twoPeriodsAgoEndDate, -dayCount + 1);

  return {
    current: dateRange,
    previous: {
      endDate: previousEndDate,
      startDate: previousStartDate,
    },
    twoPeriodsAgo: {
      endDate: twoPeriodsAgoEndDate,
      startDate: twoPeriodsAgoStartDate,
    },
  };
}

export function getPercentChange(currentValue, previousValue) {
  if (!previousValue) {
    return currentValue ? null : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}
