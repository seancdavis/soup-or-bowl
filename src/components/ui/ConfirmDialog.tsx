import { useState, useRef, useEffect, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  children: ReactNode;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const confirmedRef = useRef(false);

  // Close on escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // Delay to prevent the opening click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  const handleTriggerSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    // If this submit was triggered by our confirm action, let it through
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }
    e.preventDefault();
    // Store the form for later submission
    formRef.current = (e.target as HTMLElement).closest("form") as HTMLFormElement;
    setOpen(true);
  };

  const handleConfirm = () => {
    if (formRef.current) {
      confirmedRef.current = true;
      formRef.current.requestSubmit();
    }
    setOpen(false);
  };

  const isDanger = variant === "danger";

  return (
    <>
      {/* Wrap children forms - intercept their submit */}
      <div onSubmitCapture={handleTriggerSubmit}>
        {children}
      </div>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-primary-950/80 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            ref={dialogRef}
            className="relative bg-primary-900 border border-primary-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up"
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-primary-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isDanger ? "bg-red-500/20" : "bg-gold-500/20"
            }`}>
              <AlertTriangle className={`w-6 h-6 ${isDanger ? "text-red-400" : "text-gold-400"}`} />
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-primary-300 text-sm mb-6">{message}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={isDanger ? "secondary" : "primary"}
                size="sm"
                className={isDanger ? "border-red-500 text-red-400 hover:text-red-300 hover:border-red-400" : ""}
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
