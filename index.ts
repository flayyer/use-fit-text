import {
  DependencyList,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { dequal } from 'dequal/lite';

export type TLogLevel = "debug" | "info" | "warn" | "error" | "none";

export type TOptions = {
  logLevel?: TLogLevel;
  maxFontSize?: number;
  minFontSize?: number;
  onFinish?: (fontSize: number) => void;
  onStart?: () => void;
  resolution?: number;
};

const LOG_LEVEL: Record<TLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  none: 100,
};

// Suppress `useLayoutEffect` warning when rendering on the server
// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
const useIsoLayoutEffect =
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
    ? useLayoutEffect
    : useEffect;

export function useFitText<T extends HTMLElement = HTMLDivElement>({
  logLevel: logLevelOption = "warn",
  maxFontSize = 100,
  minFontSize = 20,
  onFinish,
  onStart,
  /** Lower values are more strict but causes more renders, defaults to `5` */
  resolution = 5,
}: TOptions = {}, deps?: DependencyList) {
  const logLevel = LOG_LEVEL[logLevelOption];

  const initState = useCallback(() => {
    return {
      calcKey: 0,
      fontSize: maxFontSize,
      fontSizePrev: minFontSize,
      fontSizeMax: maxFontSize,
      fontSizeMin: minFontSize,
    };
  }, [maxFontSize, minFontSize]);

  const ref = useRef<T>(null);
  const isCalculatingRef = useRef(false);
  const depsPrevRef = useRef<DependencyList>();
  const [state, setState] = useState(initState);
  const [isCalculating, setCalculating] = useState(false);
  const { calcKey, fontSize, fontSizeMax, fontSizeMin, fontSizePrev } = state;

  // Monitor div size changes and recalculate on resize
  let animationFrameId: number | null = null;
  const [ro] = useState(
    () =>
      new window.ResizeObserver(() => {
        animationFrameId = window.requestAnimationFrame(() => {
          if (isCalculatingRef.current) {
            return;
          }
          onStart && onStart();
          isCalculatingRef.current = true;
          setCalculating(true);
          // `calcKey` is used in the dependencies array of
          // `useIsoLayoutEffect` below. It is incremented so that the font size
          // will be recalculated even if the previous state didn't change (e.g.
          // when the text fit initially).
          setState({
            ...initState(),
            calcKey: calcKey + 1,
          });
        });
      }),
  );

  useEffect(() => {
    if (ref.current) {
      ro.observe(ref.current);
    }
    return () => {
      animationFrameId && window.cancelAnimationFrame(animationFrameId);
      ro.disconnect();
    };
  }, [animationFrameId, ro]);

  // Recalculate when dependencies change
  const depsPrev = depsPrevRef.current;
  useEffect(() => {
    if (calcKey === 0 || isCalculatingRef.current) {
      return;
    }
    if (!dequal(depsPrev, deps)) {
      onStart && onStart();
      setCalculating(true);
      setState({
        ...initState(),
        calcKey: calcKey + 1,
      });
    }
    depsPrevRef.current = deps;
  }, [calcKey, initState, onStart, depsPrev, ...deps]);

  // Check overflow and resize font
  useIsoLayoutEffect(() => {
    // Don't start calculating font size until the `resizeKey` is incremented
    // above in the `ResizeObserver` callback. This avoids an extra resize
    // on initialization.
    if (calcKey === 0) {
      return;
    }

    const isWithinResolution = Math.abs(fontSize - fontSizePrev) <= resolution;
    const isOverflow =
      !!ref.current &&
      (ref.current.scrollHeight > ref.current.offsetHeight ||
        ref.current.scrollWidth > ref.current.offsetWidth);
    const isFailed = isOverflow && fontSize === fontSizePrev;
    const isAsc = fontSize > fontSizePrev;

    // Return if the font size has been adjusted "enough" (change within `resolution`)
    // reduce font size by one increment if it's overflowing.
    if (isWithinResolution) {
      if (isFailed) {
        isCalculatingRef.current = false;
        setCalculating(false);
        if (logLevel <= LOG_LEVEL.info) {
          console.info(
            `[use-fit-text] reached \`minFontSize = ${minFontSize}\` without fitting text`,
          );
        }
      } else if (isOverflow) {
        setState({
          fontSize: isAsc ? fontSizePrev : fontSizeMin,
          fontSizeMax,
          fontSizeMin,
          fontSizePrev,
          calcKey,
        });
      } else {
        isCalculatingRef.current = false;
        setCalculating(false);
        onFinish && onFinish(fontSize);
      }
      return;
    }

    // Binary search to adjust font size
    let delta: number;
    let newMax = fontSizeMax;
    let newMin = fontSizeMin;
    if (isOverflow) {
      delta = isAsc ? fontSizePrev - fontSize : fontSizeMin - fontSize;
      newMax = Math.min(fontSizeMax, fontSize);
    } else {
      delta = isAsc ? fontSizeMax - fontSize : fontSizePrev - fontSize;
      newMin = Math.max(fontSizeMin, fontSize);
    }
    setState({
      calcKey,
      fontSize: fontSize + delta / 2,
      fontSizeMax: newMax,
      fontSizeMin: newMin,
      fontSizePrev: fontSize,
    });
  }, [
    calcKey,
    fontSize,
    fontSizeMax,
    fontSizeMin,
    fontSizePrev,
    onFinish,
    ref,
    resolution,
  ]);

  return { fontSize: `${fontSize}%`, ref, isCalculating };
};
