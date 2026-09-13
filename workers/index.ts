import "dotenv/config";
import "./auction-closer.worker";
import "./notification.worker";
import "./refund.worker";
import "./reconciliation.worker";

console.log("All workers booted");