export type UserRole = "user" | "super_admin" | "operations_admin" | "finance_admin" | "compliance_admin" | "support_admin";

export type UserStatus = "active" | "pending" | "restricted" | "suspended" | "blocked";

export type KycStatus = "pending" | "verified" | "rejected";

export type AuctionStatus =
  | "draft"
  | "scheduled"
  | "registration_open"
  | "live"
  | "ended"
  | "payment_pending"
  | "completed"
  | "cancelled"
  | "defaulted"
  | "reauctioned";

export type InventoryStatus =
  | "available"
  | "scheduled"
  | "live"
  | "sold"
  | "reserved"
  | "shipped"
  | "delivered"
  | "returned"
  | "reauction";

export type PaymentStatus =
  | "pending"
  | "submitted"
  | "under_review"
  | "verified"
  | "rejected"
  | "reversed"
  | "refunded"
  | "reconciled";

export type PaymentType = "participation_fee" | "emd" | "balance" | "refund";

export type RefundStatus =
  | "pending_review"
  | "approved"
  | "processing"
  | "paid"
  | "failed"
  | "retry"
  | "cancelled";

export type OrderStatus =
  | "payment_pending"
  | "paid"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "failed"
  | "returned"
  | "cancelled";

export type BidStatus = "accepted" | "rejected";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type NotificationChannel = "email" | "sms" | "whatsapp" | "push";

export type FinancialEventType =
  | "participation_fee"
  | "participation_fee_gst"
  | "emd_received"
  | "emd_locked"
  | "emd_released"
  | "emd_refunded"
  | "emd_adjusted"
  | "emd_forfeited"
  | "winner_balance_payable"
  | "winner_balance_received"
  | "order_created"
  | "refund"
  | "reversal"
  | "adjustment";

export type AuditEntityType =
  | "user"
  | "auction"
  | "bid"
  | "payment"
  | "order"
  | "refund"
  | "product"
  | "inventory"
  | "emd"
  | "bank_account"
  | "kyc"
  | "shipment"
  | "notification"
  | "support_ticket"
  | "admin_user"
  | "role_permission"
  | "system_setting"
  | "fraud_flag";

export type AdminModule =
  | "users"
  | "auctions"
  | "products"
  | "payments"
  | "orders"
  | "refunds"
  | "reports"
  | "audit"
  | "settings"
  | "notifications"
  | "support";
