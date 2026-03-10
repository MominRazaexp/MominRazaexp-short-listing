import { processCandidateToolChain } from "@/lib/chains/processCandidateToolChain";

export type ProcessOpts = {
  dry?: boolean;
  test?: boolean;
  markRead?: boolean;
};

export async function processGmailMessage(gmailMessageId: string, opts: ProcessOpts, origin: string) {
  return processCandidateToolChain.invoke({
    gmailMessageId,
    dry: !!opts.dry,
    test: !!opts.test,
    markRead: !!opts.markRead,
    origin
  });
}
