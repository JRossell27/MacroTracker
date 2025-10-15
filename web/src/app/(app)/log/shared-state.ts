export type LogActionState = {
  status: "idle" | "error";
  message?: string;
};

export const LOG_ACTION_INITIAL_STATE: LogActionState = {
  status: "idle",
};
