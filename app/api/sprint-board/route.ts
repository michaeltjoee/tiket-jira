import { parseSprintParam } from "@/lib/services/shared/jira";
import {
  hasJiraCredentials,
  JiraApiError,
  JiraConfigError,
} from "@/lib/services/server/jira";
import { getDashboardData } from "@/lib/services/server/getDashboardData";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasJiraCredentials()) {
    return Response.json(
      { error: "Missing JIRA_EMAIL or JIRA_API_TOKEN." },
      { status: 503 },
    );
  }

  const sprintParam = new URL(request.url).searchParams.get("sprint");
  const sprintNumber = parseSprintParam(sprintParam);
  if (sprintParam !== null && sprintNumber === undefined) {
    return Response.json({ error: "Invalid sprint." }, { status: 400 });
  }

  try {
    const data = await getDashboardData(sprintNumber);
    return Response.json(data);
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof JiraApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Failed to load sprint board.";
    return Response.json({ error: message }, { status: 502 });
  }
}
