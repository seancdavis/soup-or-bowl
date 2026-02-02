import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { MESSAGES, type MessageKey } from "../../lib/messages";

interface ToastProps {
  messageKey?: string;
}

export function Toast({ messageKey }: ToastProps) {
  const [visible, setVisible] = useState(false);

  const message = messageKey && messageKey in MESSAGES
    ? MESSAGES[messageKey as MessageKey]
    : null;

  useEffect(() => {
    if (!message) return;

    // Show the toast
    setVisible(true);

    // Clear the query param from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete("message");
    window.history.replaceState({}, "", url.toString());

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  const isSuccess = message.type === "success";
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div
      role="alert"
      className={`
        fixed top-12 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-2rem)]
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl
        animate-fade-in-down
        ${isSuccess
          ? "bg-green-900/90 border border-green-700/50 text-green-100"
          : "bg-red-900/90 border border-red-700/50 text-red-100"
        }
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isSuccess ? "text-green-400" : "text-red-400"}`} />
      <p className="text-sm font-medium">{message.text}</p>
      <button
        onClick={() => setVisible(false)}
        className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
