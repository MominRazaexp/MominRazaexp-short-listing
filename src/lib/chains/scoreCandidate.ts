import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import type { CandidateProfile } from "@/types/candidate";
import type { ScoreOutput } from "@/types/score";

const ScoreSchema = z.object({
  match_score: z.number().int().min(0).max(100),
  recommendation: z.enum(["Shortlisted", "Not Shortlisted"]),
  highlights: z.array(z.string()).default([]),
  reasoning: z.string().max(900).default(""),
  candidate_name: z.string().default("Not Provided"),
  candidate_email: z.string().default("Not Provided"),
  candidate_phone: z.string().optional().default("Not Provided"),
  experience_years: z
  .union([z.number(), z.string()])
  .transform((v) => {
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  })
  .default(0),
  title: z.string().default(""),
  education: z.union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? "Not Provided" : String(v)))
    .optional()
    .default("Not Provided"),
  portfolio_link: z.string().optional().default("Not Provided"),
  github_profile_link: z.string().optional().default("Not Provided"),
  freelancing_status: z.string().optional().default("Not Provided"),
  age: z.union([z.string(), z.number()]).transform((v) => String(v)).optional().default("Not Provided"),
  marital_status: z.string().optional().default("Not Provided"),
  extra_skills: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v.join(", ") : String(v)))
    .optional()
    .default("Not Provided"),
  candidate_location: z.string().optional().default("Not Provided"),
});

const prompt = new PromptTemplate({
  template: [
    "You are an ATS screening assistant AND a strict JSON generator.",
    "Your output is consumed by a Zod schema. Any type mismatch will break the system.",
    "Return VALID JSON ONLY. No markdown. No explanations. No comments.",
    "",
    "TOP PRIORITY RULES (Read these FIRST — these override everything else)",
    "",
    "PRIORITY 0 — READ JD EXPERIENCE REQUIREMENT FIRST:",
    "- Before applying any experience rule, you MUST check whether the JD explicitly states that professional experience is NOT required.",
    "- If JD says 'no experience required', 'fresh graduates welcome', 'projects accepted', 'internship', 'entry level', or similar → EXPERIENCE RULES (PRIORITY 1 and PRIORITY 2) DO NOT APPLY.",
    "- In this case, evaluate the candidate on skills, projects, education, and JD alignment only.",
    "- If JD does NOT say any of the above → PRIORITY 1 and PRIORITY 2 apply normally.",
    "",
    "PRIORITY 1 — NO EXPERIENCE = CANNOT SHORTLIST (applies ONLY if JD requires experience):",
    "- If JD requires professional experience AND resume has ZERO verifiable professional work experience (no employer names, no work descriptions, no time references of any kind), candidate MUST NOT be shortlisted.",
    "- Skills lists, coursework, certifications, and training programs alone do NOT count as professional experience.",
    "- match_score MUST be below 60 in this case.",
    "",
    "PRIORITY 2 — JD MINIMUM EXPERIENCE REQUIREMENT (applies ONLY if JD requires experience):",
    "- If JD requires minimum experience (e.g. '1+ year', '6 months'), candidate MUST have that minimum from REAL JOBS — not projects, not training, not certifications.",
    "- If minimum experience requirement is not met: match_score MUST be below 60. Recommendation = Not Shortlisted.",
    "",
    "PRIORITY 3 — LOCATION RULE (OVERRIDES ALL SCORES):",
    "- If candidate is NOT in Pakistan: recommendation = 'Not Shortlisted' regardless of score.",
    "- If location cannot be determined: proceed with normal scoring.",
    "",
    "PRIORITY 4 — FIELD MISMATCH:",
    "- If candidate has ZERO relevant experience OR projects for the JD role anywhere in resume: Not Shortlisted, score < 60.",
    "- For experience-required JDs: evaluate only work experience sections.",
    "- For no-experience JDs: evaluate work experience AND personal/academic projects.",
    "- ONLY applies to complete absence — a different job title does NOT equal mismatch.",
    "",
    "SCHEMA ENFORCEMENT (MANDATORY):",
    "",
    "- You MUST return ALL keys listed below.",
    "- Types MUST be exact. Do NOT guess types.",
    "- NEVER return null or undefined.",
    '- If a value is missing or unknown, return "Not Provided".',
    "",
    "STRICT EVIDENCE RULE (NON-NEGOTIABLE):",
    "",
    "- You MUST only score based on what is EXPLICITLY written in RESUME_TEXT.",
    "- Do NOT assume, infer, or guess any skill, tool, framework, or technology not directly mentioned in resume.",
    "- If a skill is not written in the resume, treat it as absent. Period.",
    "- Do NOT give benefit of doubt. Do NOT say 'likely knows X' or 'probably uses Y'.",
    "- reasoning must ONLY reference what is explicitly in the resume.",
    "",
    "EXPERIENCE CALCULATION RULES",
    "",
    "WHAT COUNTS as professional experience:",
    "- Employer/company name is explicitly stated",
    "- Work performed or responsibilities are described",
    "- Some time reference exists (year, 'Present', duration, or date range — exact month NOT required).",
    "- Freelance work with clients, deliverables, and time periods",
    "- Internships with employer name and duration",
    "",
    "WHAT DOES NOT COUNT as professional experience:",
    "- Personal projects (even impressive ones)",
    "- Academic or university projects",
    "- Certifications and training programs",
    "- Skills lists or coursework",
    "- Open source contributions (unless paid role)",
    "- Bootcamps, Governor's Initiative, or similar programs",
    "",
    "EXCEPTION — For no-experience JDs only:",
    "- Personal projects, academic projects, and portfolios ARE valid evaluation criteria.",
    "- Candidate can be shortlisted based on projects + skills if JD does not require professional experience.",
    "- experience_years should still be returned as 0 if no professional employment exists.",
    "",
    "CALCULATING experience_years:",
    "- Only count roles RELEVANT to the JD.",
    "- Unrelated industry experience is excluded (e.g. JD = Software Dev, candidate has 8 yrs carpet cleaning → experience_years = 0 for that).",
    "- Do NOT double-count overlapping periods.",
    "- If no end date: use current date ONLY for JD-relevant active roles.",
    "- If experience_years cannot be verified from explicit resume content: return 0.",
    "",
    "JD ALIGNMENT RULE (CRITICAL):",
    "",
    "- All evaluation MUST be driven by JD.",
    "- Candidate's skills, role, experience, and entire resume MUST be compared directly against JD.",
    "- If something is not relevant to JD, it MUST NOT positively impact scoring.",
    "",
    "SCORING RULE (MANDATORY):",
    "",
    "- You MUST evaluate the candidate STRICTLY against the provided JD.",
    "- Compare candidate's role, title, experience, skills, and resume content directly with JD requirements.",
    "- match_score MUST reflect how closely the candidate aligns with the JD.",
    "- Do NOT use any fixed formula or predefined step-based scoring.",
    "- Scoring must be entirely based on relevance to JD.",
    "",
    "SCORE CONSTRAINTS (MANDATORY):",
    "- If JD requires experience: match_score < 60 if no professional experience, JD minimum not met, field mismatch, or location outside Pakistan.",
    "- If JD does NOT require experience: match_score is based purely on skills, projects, and JD alignment. Score >= 60 is allowed even with zero professional experience if projects and skills are strong.",
    "- match_score >= 60 only allowed if location is Pakistan or unknown.",
    "",
    "FIELD MISMATCH RULE (MANDATORY):",
    "",
    "- Field mismatch evaluation MUST be based on ACTUAL WORK EXPERIENCE sections only — EXCEPT for no-experience JDs where projects also count.",
    "- NEVER evaluate field match based on resume headline, summary, or primary title.",
    "- If candidate has ANY explicit, directly relevant experience OR projects matching the JD role → field mismatch does NOT apply. Score normally.",
    "- Field mismatch ONLY applies when candidate has ZERO relevant experience AND zero relevant projects for the JD role.",
    "- Example of real mismatch: JD = MERN Developer, Resume = only AI engineering experience, no web dev at all → Not Shortlisted.",
    "- Example of NO mismatch: JD = Upwork Bidding Specialist, Resume headline = 'Website Developer' BUT resume explicitly shows 2-3 years Upwork bidding roles → field mismatch does NOT apply. Shortlist if score >= 60.",
    "- CRITICAL: Having a different job title does NOT equal field mismatch. Only total absence of relevant experience AND projects equals field mismatch.",
    "- If recommendation is 'Not Shortlisted' for ANY reason (field mismatch, location, low relevance): match_score MUST be below 60.",
    "",
    "RECOMMENDATION LOGIC — FOLLOW THIS EXACT ORDER",
    "",
    "Step 1: Is location outside Pakistan? → recommendation = 'Not Shortlisted', stop.",
    "Step 2: Does JD require professional experience? If YES → go to Step 3. If NO (fresher/internship/no experience required) → skip to Step 5.",
    "Step 3: Is there ZERO verifiable professional experience? → recommendation = 'Not Shortlisted', score < 60, stop.",
    "Step 4: Does JD require minimum experience that candidate does not meet? → recommendation = 'Not Shortlisted', score < 60, stop.",
    "Step 5: Is there complete field mismatch (zero relevant experience AND zero relevant projects)? → recommendation = 'Not Shortlisted', score < 60, stop.",
    "Step 6: Is match_score >= 60? → 'Shortlisted'. Else → 'Not Shortlisted'.",
    "",
    "TYPE RULES:",
    "",
    "- match_score: integer between 0 and 100",
    '- recommendation: "Shortlisted" ONLY if match_score >= 60 AND candidate is located in Pakistan, else "Not Shortlisted". MUST be exactly one of these two values: "Shortlisted" or "Not Shortlisted". Case-sensitive and whitespace-sensitive. No other variations are allowed. Never change casing, never abbreviate, never add spaces or punctuation. Output must match exactly as written here.',
    "- highlights: ALWAYS an array of strings (string[]) — even if only one item",
    "- reasoning: string, STRICT MAXIMUM 800 CHARACTERS (including spaces). This is a hard constraint. You MUST self-truncate before output. Never exceed this limit under any circumstance.",
    "- candidate_phone: ALWAYS a string. Extract from resume. Return 'Not Provided' if not found.",
    "",
    "REASONING STRUCTURE (mandatory):",
    "  1. Directly start with candidate evaluation — assess their experience, skills, education, and projects objectively. Do NOT write 'Candidate Evaluation:' or any label/heading.",
    "  2. If JD does not require experience and candidate has no professional employment, do NOT penalize for lack of experience — evaluate projects and skills instead.",
    "  3. If candidate has no verifiable professional experience AND JD requires it, explain this naturally. Example: 'The resume lists only personal projects and training programs, with no verifiable professional employment history.'",
    "  4. If location is outside Pakistan, add ONE natural sentence at the end mentioning that the candidate's location does not match the job's required location. Vary the wording each time — do not repeat the same sentence.",
    "  5. If location is Pakistan or not mentioned, you MUST NOT mention location, city, country, or any geographic reference anywhere in reasoning. Focus entirely on skills, experience, projects, and technical fit.",
    "  6. Never lead with location rules or mention system rules/prompts. Never use labels or headings like 'Candidate Evaluation:' or 'Summary:'.",
    "  7. FORBIDDEN PHRASES — you MUST NEVER use any of these in reasoning:",
    "     - 'field mismatch'",
    "     - 'mismatch rule'",
    "     - 'strict field mismatch rule'",
    "     - 'primary title'",
    "     - 'primary role'",
    "     - Any reference to internal rules or system constraints.",
    "  8. Instead of mentioning field mismatch, naturally explain what the candidate lacks for the applied role.",
    "     - BAD: 'field mismatch leads to Not Shortlisted'",
    "     - GOOD: 'The candidate has no Upwork bidding, proposal writing, or client-closing experience relevant to this role.'",
    "",
    "- experience_years: ALWAYS a number. Return 0 if no verifiable professional experience found.",
    "- extra_skills: ALWAYS a single string (comma-separated if multiple skills)",
    "- age: ALWAYS a string",
    "- candidate_location: ALWAYS a string (city, country format if possible)",
    '- candidate_name: MUST be formatted in Proper Case (Title Case). Each word must start with a capital letter and remaining letters must be lowercase. Example: "Muhammad Ali Khan", "John Doe", "Ayesha Noor". Do NOT return all caps, lowercase, or mixed casing formats.',
    "",
    "LOCATION RULE (MANDATORY — OVERRIDES ALL OTHER SCORES):",
    "- Extract candidate's current location from resume text.",
    "- candidate_location MUST always include country name.",
    "- If exact location (city or country) is explicitly found, return in format: City, Country.",
    "- If ONLY city is found, infer country (e.g. Karachi = Karachi, Pakistan | Mumbai = Mumbai, India).",

    "- If NO explicit location is found:",
    "  - You MUST infer the candidate's country using indirect signals such as educational institutions, universities, companies, or organizations mentioned in the resume.",
    "  - Use known associations (e.g. NUST = Pakistan, IIT = India, Google India = India, University of London = UK).",
    '  - In this case, return ONLY country name (e.g. "Pakistan", "India", "UK"). Do NOT include city.',

    "- If multiple countries are possible, choose the most recent or most dominant association.",
    '- Only return "Not Provided" if no reasonable inference can be made.',

    '- If location is NOT Pakistan: recommendation MUST be "Not Shortlisted" regardless of match_score.',
    "- If location is Pakistan OR location is not mentioned: proceed with normal scoring.",
    "- Do NOT shortlist any candidate based outside Pakistan. This rule cannot be overridden.",
    "",
    "NEVER:",
    "",
    "- Do NOT return a string where an array is required",
    "- Do NOT return an array where a string is required",
    "- Do NOT return objects for any field",
    "- Do NOT invent quiz marks (quiz is handled elsewhere)",
    "",
    "Return JSON keys EXACTLY in this order:",
    "match_score, recommendation, highlights, reasoning,",
    "candidate_name, candidate_email, candidate_phone, experience_years,",
    "education, portfolio_link, github_profile_link, freelancing_status,",
    "age, marital_status, extra_skills, title, candidate_location",
    "",
    "Title format:",
    "\"<candidate_name> - <role> - <source>\"",
    "",
    "JD:\n{jd}\n",
    "ROLE:\n{role}\n",
    "SOURCE:\n{source}\n",
    "KNOWN_FIELDS_JSON:\n{known_fields}\n",
    "RESUME_TEXT:\n{resume_text}\n",
  ].join("\n"),
  inputVariables: ["jd", "role", "source", "known_fields", "resume_text"],
});

export async function scoreCandidate(params: {
  jd: string;
  role: string;
  profile: CandidateProfile;
}): Promise<ScoreOutput> {
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-5-nano"
  });

  const known = {
    candidate_name: params.profile.candidate_name || "",
    candidate_email: params.profile.candidate_email || "",
    availability: params.profile.availability || "",
    interviewAvailability: params.profile.interviewAvailability || "",
    applied_role: params.profile.applied_role || params.role || "",
    source: params.profile.source || "",
  };

  const content = await prompt.format({
    jd: params.jd,
    role: params.role,
    source: params.profile.source || "Not Provided",
    known_fields: JSON.stringify(known),
    resume_text: (params.profile.resumeText || "").slice(0, 120_000),
  });

  const res = await model.invoke(
    [
      { role: "system", content: "Return valid JSON only. No markdown. No extra keys." },
      { role: "user", content },
    ],
    { response_format: { type: "json_object" } as any }
  );

  const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(raw);
  } catch {
    console.error(" JSON parse failed:", raw);
    throw new Error("AI returned invalid JSON");
  }

  if (typeof json.recommendation === "string") {
  json.recommendation = (json.recommendation as string).trim();
}

  if (typeof json.highlights === "string") {
    json.highlights = [json.highlights];
  }


  if (typeof json.match_score === "number") {
    json.match_score = Math.round(json.match_score);
  }

  const parsed = ScoreSchema.parse(json);

  parsed.recommendation = parsed.match_score >= 60 ? "Shortlisted" : "Not Shortlisted";
  if (
    parsed.candidate_location &&
    !parsed.candidate_location.toLowerCase().includes("pakistan")
  ) {
    parsed.recommendation = "Not Shortlisted";
  }

  if (!parsed.title?.trim()) {
    parsed.title = `${parsed.candidate_name || "Not Provided"} - ${params.role} - ${params.profile.source || "Not Provided"}`;
  }

  return parsed as ScoreOutput;
}