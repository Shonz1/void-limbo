export enum EventPriority {
  LOWEST = 0,
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  HIGHEST = 4,
}

type EventHandler = (event: Record<string, unknown>) => Promise<boolean>;

export class EventManager {
  private readonly _handlers = new Map<string, Map<EventPriority, Set<EventHandler>>>();

  subscribe(event: string, handler: EventHandler, priority = EventPriority.NORMAL) {
    let priorities = this._handlers.get(event);
    if (!priorities) {
      priorities = new Map();
      this._handlers.set(event, priorities);
    }

    let handlers = priorities.get(priority);
    if (!handlers) {
      handlers = new Set();
      priorities.set(priority, handlers);
    }

    handlers.add(handler);

    return this;
  }

  async fire(event: string, data: Record<string, unknown>): Promise<boolean> {
    const priorities = this._handlers.get(event);
    if (priorities) {
      for (const [, handlers] of [...priorities.entries()].sort((a, b) => b[0] - a[0])) {
        for (const handler of handlers) {
          const cancelled = await handler(data).catch(err => console.error(err));

          if (cancelled) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

export const eventManager = new EventManager();
