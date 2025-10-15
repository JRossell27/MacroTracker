"use client";

import { useActionState } from "react";
import { addNoteAction, INITIAL_STATE } from "../actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type AddNoteFormProps = {
  dailyLogId: string | null;
};

export function AddNoteForm({ dailyLogId }: AddNoteFormProps) {
  const [state, dispatch] = useActionState(addNoteAction, INITIAL_STATE);
  const isDisabled = !dailyLogId;

  return (
    <form action={dispatch} className="space-y-3">
      <input type="hidden" name="dailyLogId" value={dailyLogId ?? ""} />
      <textarea
        name="note"
        rows={3}
        disabled={isDisabled}
        placeholder={
          isDisabled
            ? "Create your day summary to add notes."
            : "Add context about energy, sleep, or training quality."
        }
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
      />
      {state.status === "error" && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {state.message ?? "Unable to save note. Try again."}
        </p>
      )}
      <FormSubmitButton disabled={isDisabled} pendingLabel="Saving note…">
        {isDisabled ? "Create summary first" : "Add note"}
      </FormSubmitButton>
    </form>
  );
}
