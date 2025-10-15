"use client";

import clsx from "clsx";
import { useFormStatus } from "react-dom";

type InlineDeleteButtonProps = {
  label?: string;
  pendingLabel?: string;
  className?: string;
};

export function InlineDeleteButton({
  label = "Remove",
  pendingLabel = "Removing…",
  className,
}: InlineDeleteButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "text-xs font-medium text-rose-300 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
