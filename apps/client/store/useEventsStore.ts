import { Event } from "@/constants/types";
import { api } from "@/services/api";
import { create } from "zustand";


type EventsStore = {
  events: Event[],
  addEvent: (event: Event) => Promise<void>;
  localAddEvent: (event: Event) => void;
  loadEvents: (events: Event[]) => void;
  removeEvent: (event: Event) => Promise<void>;
  localRemoveEvent: (event: Event) => void;
  updateEvent: (event: Event) => Promise<void>;
  localUpdateEvent: (event: Event) => void;
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  addEvent: async (event) => {
    const result = await api.createEvent(event);
    const newEvent: Event = {
      title: result.title,
      id: result.id,
      color: result.color,
      start: result.start,
      end: result.end,
      calendars: result.calendars,
      creatorID: result.creatorID,
    }
    set((state) => ({
      events: [...state.events.filter(e => e.id !== newEvent.id), newEvent]
    }));
  },
  localAddEvent: (event: Event) => {
    if (get().events.some(e => e.id === event.id)) {
      return;
    }
    set((state) => ({
      events: [...state.events, event],
    }));
  },
  loadEvents: (events) => set(() => ({
    events: events,
  })),
  removeEvent: async (event) => {
    const result = await api.removeEvent(event);
    set((state) => ({
      events: [...state.events.filter(e => e.id !== result)],
    }));
  },
  localRemoveEvent: (event) => {
    set((state) => ({
      events: [...state.events.filter(e => e.id !== event.id)],
    }));
  },
  updateEvent: async (event) => {
    const result = await api.updateEvent(event);
    set((state) => ({
      events: [...state.events.filter(e => e.id !== result.id), result],
    }));
  },
  localUpdateEvent: (event) => {
    set((state) => ({
      events: [...state.events.filter(e => e.id !== event.id), event],
    }));
  },
}));
