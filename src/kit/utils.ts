import {
  useState,
  useRef,
  useEffect,
  type Ref,
  type MutableRefObject,
} from "react";
export const cx = (...values: unknown[]) =>
  values.filter((v) => typeof v === "string" && v).join(" ");
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value === undefined ? internal : value;
  const set = (next: T) => {
    if (value === undefined) setInternal(next);
    if (next !== current) onChange?.(next);
  };
  return [current, set] as const;
}
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as MutableRefObject<T | null>).current = value;
}
