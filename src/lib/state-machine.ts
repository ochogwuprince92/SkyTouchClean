// State machine for order/booking status transitions
export type OrderStatus =
  | "PENDING_REVIEW"
  | "AWAITING_CUSTOMER_CONFIRMATION"
  | "CONFIRMED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export const STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_REVIEW: ["AWAITING_CUSTOMER_CONFIRMATION", "CANCELLED"],
  AWAITING_CUSTOMER_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

export function isValidTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  const allowed = STATE_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export function isTerminalState(status: OrderStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED";
}
