import { useEffect, useReducer, useRef, RefObject } from 'react';

export interface UseCarousel {
  readonly coordinate: number;
  readonly carouselRef: RefObject<HTMLDivElement>;
  jump(idx: number): void;
  previous(): void;
  next(): void;
}

export enum CarouselType {
  jump = 'jump',
  previous = 'previous',
  next = 'next',
  move = 'move',
  moveStart = 'moveStart',
  moveEnd = 'moveEnd',
}

interface State {
  readonly coordinate: number;
  readonly current: number;
  readonly length: number;
  readonly percentage: number;
  readonly startX: number;
}

interface Action {
  readonly type: CarouselType;
  readonly current?: number;
  readonly event?: TouchEvent;
}

export interface MoveInit {
  readonly event: TouchEvent;
  readonly startX: number;
  readonly current: number;
  readonly length: number;
}

export function nextItem(current: number, length: number) {
  return (current + 1 + length) % length;
}

export function previousItem(current: number, length: number) {
  return (current - 1 + length) % length;
}

export function previous(current: number, length: number) {
  return (Math.abs(previousItem(current, length)) * -1 * 100) / length;
}

export function next(current: number, length: number) {
  return (Math.abs(nextItem(current, length)) * -1 * 100) / length;
}

export function jump(current: number, length: number) {
  return (Math.abs(current) * -1 * 100) / length;
}

export function move({ event, startX, current, length }: MoveInit) {
  event.preventDefault();
  const { clientX, target } = event.touches[0];
  const { width } = target as HTMLImageElement | HTMLVideoElement;

  const delta = startX - clientX;
  const percentage = (delta * 100) / width;
  const direction = Math.sign(-percentage);

  const coordinate =
    (Math.abs(percentage) / length) * direction * (current + 1);

  return {
    coordinate: +coordinate.toFixed(3),
    percentage: Math.abs(+percentage.toFixed(3)),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case CarouselType.jump: {
      return {
        ...state,
        ...((action.current as number) < state.length && {
          current: action.current as number,
          coordinate: jump(action.current as number, state.length),
        }),
      };
    }

    case CarouselType.previous: {
      return {
        ...state,
        current: previousItem(state.current, state.length),
        coordinate: previous(state.current, state.length),
      };
    }

    case CarouselType.next: {
      return {
        ...state,
        current: nextItem(state.current, state.length),
        coordinate: next(state.current, state.length),
      };
    }

    case CarouselType.moveStart: {
      return {
        ...state,
        startX: action.event?.touches[0].clientX ?? 0,
      };
    }

    case CarouselType.move: {
      const moveInit = {
        event: action.event as TouchEvent,
        startX: state.startX ?? 0,
        current: state.current,
        length: state.length,
      };

      const { coordinate, percentage } = move(moveInit);

      return {
        ...state,
        coordinate,
        percentage,
      };
    }

    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
}

const initialState: State = {
  coordinate: 0,
  current: 0,
  length: 0,
  percentage: 0,
  startX: 0,
};

export function useCarousel(length: number): UseCarousel {
  Object.defineProperty(initialState, 'length', {
    value: length,
    writable: false,
  });
  const carouselRef = useRef<HTMLDivElement>(null);
  const [{ coordinate }, dispatch] = useReducer(reducer, initialState);

  const jump = (idx: number) =>
    dispatch({ type: CarouselType.jump, current: idx });

  const next = () => dispatch({ type: CarouselType.next });
  const previous = () => dispatch({ type: CarouselType.previous });

  const moveStart = (event: TouchEvent) =>
    dispatch({ type: CarouselType.moveStart, event });

  const move = (event: TouchEvent) =>
    dispatch({
      type: CarouselType.move,
      event,
    });

  useEffect(() => {
    carouselRef.current?.addEventListener('touchstart', moveStart);
    carouselRef.current?.addEventListener('touchmove', move);

    return () => {
      carouselRef.current?.removeEventListener('touchstart', moveStart);
      carouselRef.current?.removeEventListener('touchmove', move);
    };
  }, []);

  return { coordinate, jump, previous, next, carouselRef };
}
