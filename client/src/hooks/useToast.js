
import { useCallback, useContext } from "react";
import { useToastContext } from "../components/ui/ToastProvider";

// Toast hook: uses ToastContext if present, else falls back to console
export default function useToast() {
  const ctx = useToastContext?.();
  const success = useCallback((msg) => {
    if (ctx?.success) return ctx.success(msg);
    // eslint-disable-next-line no-console
    console.info("Toast success:", msg);
  }, [ctx]);
  const error = useCallback((msg) => {
    if (ctx?.error) return ctx.error(msg);
    // eslint-disable-next-line no-console
    console.error("Toast error:", msg);
  }, [ctx]);
  const warning = useCallback((msg) => {
    if (ctx?.warning) return ctx.warning(msg);
    // eslint-disable-next-line no-console
    console.warn("Toast warning:", msg);
  }, [ctx]);
  const info = useCallback((msg) => {
    if (ctx?.info) return ctx.info(msg);
    // eslint-disable-next-line no-console
    console.log("Toast info:", msg);
  }, [ctx]);
  const removeToast = useCallback(() => {
    if (ctx?.removeToast) return ctx.removeToast();
  }, [ctx]);
  return { success, error, warning, info, removeToast };
}
