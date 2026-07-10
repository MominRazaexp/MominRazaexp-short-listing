export async function createTrelloCard(input: { name: string; role: string; quizMarks: string; score: any; profile: any }) {
  const key = process.env.TRELLO_KEY ?? "";
  const token = process.env.TRELLO_TOKEN ?? "";
  const listId = process.env.TRELLO_LIST_ID ?? "";
  if (!key || !token || !listId) throw new Error("Missing Trello env vars.");

  function buildTrelloDesc(params: {
    role: string;
    quizMarks: string;
    score: any;
    profile: any;
  }) {
    const { role, quizMarks, score, profile } = params;

    const jobUrl = profile.fullApplicationUrl || profile.jobUrl;
    const emailUrl = profile.emailUrl;
    const isDirectEmail = input.name.includes("Direct Email")
    const cvUrl = profile.resumeUrl;
    const formattedAnswer = (profile.screenerQA?.answer || "Not Provided")
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .join(" | ");
    const quizMarksField = isDirectEmail
      ? []
      : [`**Quiz Marks (In %):** ${quizMarks}`];

    return [
      `**Name:** ${score.candidate_name || "Not Provided"}`,
      `**Email:** ${score.candidate_email || "Not Provided"}`,
      `**Phone:** ${score.candidate_phone || "Not Provided"}`,
      `**Location:** ${score.candidate_location || "Not Provided"}`,
      `**Applied For Role:** ${role || "Not Provided"}`,
      `**Source:** ${profile.source || "Indeed"}`,
      ...quizMarksField,
      `**AI Score (Match %):** ${Number(score.match_score || 0)}`,
      `**Reasoning:** ${score.reasoning || "Not Provided"}`,
      `**Education:** ${score.education || "Not Provided"}`,
      `**Portfolio Link:** ${score.portfolio_link || "Not Provided"}`,
      `**Github Profile Link:** ${score.github_profile_link || "Not Provided"}`,
      `**Experience:** ${score.experience_years ?? "Not Provided"} Years`,
      `**Freelancing Status:** ${score.freelancing_status || "Not Provided"}`,
      `**Age:** ${score.age || "Not Provided"}`,
      `**Marital Status:** ${score.marital_status || "Not Provided"}`,
      `**Availability:** ${profile.availability || "Not Provided"}`,
      `**Reason for Leaving:** ${profile.reasonForLeaving || "Not Provided"}`,
      `**Interview Availability:** ${profile.interviewAvailability || "Not Provided"}`,
      `**Extra Skills:** ${score.extra_skills || "Not Provided"}`,
      `${
        isDirectEmail
          ? `**Email URL:** ${
              emailUrl ? `[Click here](${emailUrl})` : "Not Provided"
            }`
          : `**Job URL:** ${
              jobUrl ? `[Click here](${jobUrl})` : "Not Provided"
            }`
      }`,
      `**CV Link:** ${cvUrl ? `[Click here](${cvUrl})` : "Not Provided"}`,
       ...(isDirectEmail ? [] : [
        "",
        "**Salary Question & Answer**",
        `**Q:** ${profile.screenerQA?.question || "Not Provided"}`,
        `**A:** ${formattedAnswer}`,
      ]),
    ].join("\n");
  }

  const trelloDesc = buildTrelloDesc({
    role: input.role,
    quizMarks: input.quizMarks,
    score: input.score,
    profile: input.profile,
  });

  const params = new URLSearchParams({
    idList: listId,
    key,
    token,
    name: input.name,
    desc: trelloDesc,
  });

  const url = `https://api.trello.com/1/cards?${params.toString()}`;
  const res = await fetch(url, { method: "POST" });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Trello error: ${res.status} ${res.statusText} | ${body.slice(0, 500)}`);
  }

  return res.json().catch(() => null);
}
