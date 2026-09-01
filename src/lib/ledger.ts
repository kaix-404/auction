import { FinancialEventType } from "@/types";

interface LedgerPayload {
  eventType: FinancialEventType;
  userId: string;
  auctionId?: string;
  orderId?: string;
  amount: number;
  gstComponent?: number;
  status: string;
  referenceId?: string;
  sourceTransactionId?: string;
  notes?: string;
}

export async function writeFinancialLedger(payload: LedgerPayload): Promise<void> {
  try {
    const FinancialLedger = (await import("@/models/FinancialLedger")).default;
    await FinancialLedger.create({
      eventType: payload.eventType,
      userId: payload.userId,
      auctionId: payload.auctionId,
      orderId: payload.orderId,
      amount: payload.amount,
      gstComponent: payload.gstComponent || 0,
      status: payload.status,
      referenceId: payload.referenceId,
      sourceTransactionId: payload.sourceTransactionId,
      notes: payload.notes,
    });
  } catch (err) {
    console.error("Failed to write financial ledger:", err);
  }
}

export async function writeEmdLedger(payload: {
  userId: string;
  auctionId: string;
  amount: number;
  type: "locked" | "released" | "refunded" | "adjusted" | "forfeited";
  paymentSubmissionId?: string;
  refundId?: string;
  notes?: string;
  processedBy?: string;
}): Promise<void> {
  try {
    const EmdLedger = (await import("@/models/EmdLedger")).default;
    await EmdLedger.create({
      userId: payload.userId,
      auctionId: payload.auctionId,
      amount: payload.amount,
      type: payload.type,
      paymentSubmissionId: payload.paymentSubmissionId,
      refundId: payload.refundId,
      notes: payload.notes,
      processedBy: payload.processedBy,
    });
  } catch (err) {
    console.error("Failed to write EMD ledger:", err);
  }
}
