import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BankAccount from "@/models/BankAccount";
import { getAuthContext, getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accounts = await BankAccount.find({ userId: context.userId }).lean();
    const masked = accounts.map((acc) => ({
      ...acc,
      accountNumber: `****${acc.accountNumber.slice(-4)}`,
    }));
    return NextResponse.json({ accounts: masked });
  } catch (err) {
    console.error("List bank accounts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const required = ["holderName", "bankName", "accountNumber", "ifsc", "accountType"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Field '${field}' is required` }, { status: 400 });
      }
    }

    if (body.isDefault) {
      await BankAccount.updateMany({ userId: context.userId }, { isDefault: false });
    }

    const account = await BankAccount.create({
      ...body,
      userId: context.userId,
      status: "pending_review",
      isDefault: body.isDefault || false,
    });

    await writeAuditLog({
      eventType: "user.bank_account_create",
      actorId: context.userId,
      actorRole: context.role,
      action: "create_bank_account",
      entityType: "bank_account",
      entityId: account._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { bankName: body.bankName, ifsc: body.ifsc, accountType: body.accountType },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error("Create bank account error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
