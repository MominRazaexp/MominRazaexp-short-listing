import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongoose";
import { GmailWatchState } from "@/lib/models/GmailWatchState";
import { processGmailMessage } from "@/lib/gmail/processMessage";
import { PubSubPushBody } from "@/types/types";
import { decodePubSubData, parseAllowedFrom, getFromHeader, matchesAllowed, listNewMessageIds } from "@/lib/utils/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const u = new URL(req.url);
  const origin = `${u.protocol}//${u.host}`;
  const gotToken = u.searchParams.get("token") || "";
  const expectedToken = process.env.PUBSUB_VERIFICATION_TOKEN || "";
  if (expectedToken && gotToken !== expectedToken) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as PubSubPushBody;
  const dataB64 = body.message?.data;
  if (!dataB64) return NextResponse.json({ ok: true, ignored: true });

  const { emailAddress, historyId } = decodePubSubData(dataB64);

  await dbConnect();

  const state = await GmailWatchState.findOne({ key: "singleton" }).lean();
  const lastHistoryId = state?.lastHistoryId || "";

  await GmailWatchState.updateOne(
    { key: "singleton" },
    { $set: { lastHistoryId: String(historyId) } },
    { upsert: true }
  );

  if (!lastHistoryId) {
    return NextResponse.json({ ok: true, primed: true, emailAddress, historyId });
  }

  let ids: string[] = [];
  try {
    ids = await listNewMessageIds(lastHistoryId, origin);
  } catch (e: any) {
    return NextResponse.json({ ok: true, reset: true, reason: e?.message || "history error" });
  }

  const max = Number(process.env.POLL_MAX || "10");
  const markRead = process.env.POLL_MARK_READ === "1";

  const results: any[] = [];
  let matched = 0;

  for (const id of ids.slice(0, max)) {
    try {
      const alreadyProcessed = await dbConnect().then(() =>
        import("@/lib/models/CandidateResult").then(({ CandidateResult }) =>
          CandidateResult.exists({ emailMessageId: id })
        )
      );
      if (alreadyProcessed) {
        results.push({ messageId: id, ok: false, skipped: "already processed" });
        continue;
      }

      matched++;
      const r = await processGmailMessage(id, { dry: false, test: false, markRead }, origin);
      results.push(r);
    } catch (e: any) {
      results.push({ messageId: id, ok: false, error: e?.message || "push processing error" });
    }
  }

  if (results.length > 0) {
  console.info("\n**************************************");
  console.info("📬 New Gmail Processed!"); 
  console.info("✅ Processed Result:", JSON.stringify(results[0], null, 2));
  console.info("**************************************\n");
}

  return NextResponse.json({
    ok: true,
    emailAddress,
    historyId,
    received: ids.length,
    matched,
    processed: results.length,
    results,
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, note: "Use POST (Pub/Sub pushes here)" });
}
