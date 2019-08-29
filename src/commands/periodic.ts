type MaybeCategory = {
  maybeCategory: string | undefined;
};

type DateInterval = {
  interval: number;
};

export type PeriodicCommand = {
  today: MaybeCategory;
  yesterday: MaybeCategory;
  daysAgo2: MaybeCategory;
  daysAgo3: MaybeCategory;
  daysAgo: MaybeCategory & DateInterval;

  thisWeek: MaybeCategory;
  lastWeek: MaybeCategory;
  weeksAgo2: MaybeCategory;
  weeksAgo: MaybeCategory & DateInterval;

  thisMonth: MaybeCategory;
  lastMonth: MaybeCategory;
  monthsAgo2: MaybeCategory;
  monthsAgo: MaybeCategory & DateInterval;

  all: MaybeCategory;
};
