import { describe, expect, it } from "vitest";
import { ApolloApiClient } from "@/services/apolloApiClient";

describe("ApolloApiClient", () => {
  it("converts future Apollo URL filter names to API snake_case dynamically", () => {
    const body = new ApolloApiClient("test").filtersToApiBody([
      { key: "personTitles", values: ["owner"] },
      { key: "organizationNumEmployeesRanges", values: ["11,50"] },
      { key: "AI Score", values: ["high"] },
      { key: "futureSignals", values: ["hiring", "funding"] },
      { key: "page", values: ["3"] }
    ]);

    expect(body).toEqual({
      person_titles: "owner",
      organization_num_employees_ranges: "11,50",
      ai_score: "high",
      future_signals: ["hiring", "funding"]
    });
  });
});
