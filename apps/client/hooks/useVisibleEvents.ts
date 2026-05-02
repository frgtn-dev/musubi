import { useMemo } from "react";
import { Event } from "@/constants/types";
import dayjs from "dayjs";

export function useVisibleEvents(events: Event[], activeCals: Set<string>) {
  return useMemo(() => {
    const visibleEvents = events
      .filter(e => e.calendars.some(id => activeCals.has(id)))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const enrichedEvents: Record<string, typeof visibleEvents> = {};

    for (const event of visibleEvents) {
      const key = dayjs(event.start).format('YYYY-MM-DD');
      if (!enrichedEvents[key]) enrichedEvents[key] = [];
      enrichedEvents[key].push(event);
    }

    return { visibleEvents, enrichedEvents };
  }, [events, activeCals]);
}
