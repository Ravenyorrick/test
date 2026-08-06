import { describe, expect, it } from "vitest";
import { ApolloApiClient } from "@/services/apolloApiClient";
import { ApolloUrlParser } from "@/parsers/urlParser";

describe("ApolloApiClient", () => {
  it("keeps documented Apollo array parameters as arrays with one item", () => {
    const body = new ApolloApiClient("test").filtersToApiBody([
      { key: "personTitles", values: ["owner"], isArray: true, rawKeys: ["personTitles[]"] },
      { key: "organizationNumEmployeesRanges", values: ["11,50"], isArray: true, rawKeys: ["organizationNumEmployeesRanges[]"] },
      { key: "page", values: ["3"], isArray: false, rawKeys: ["page"] }
    ]);

    expect(body).toEqual({
      person_titles: ["owner"],
      organization_num_employees_ranges: ["11,50"],
      page: 3
    });
  });

  it("handles multiple titles, locations, seniority, keywords, and unknown arrays", () => {
    const parsed = new ApolloUrlParser().parse("https://app.apollo.io/#/people?page=1&personTitles[]=CEO&personTitles[]=Founder&organizationLocations[]=United%20States&organizationLocations[]=Canada&personSeniorities[]=owner&qKeywords=fintech&futureSignals[]=hiring&futureSignals[]=funding&includeSimilarTitles=true");
    const body = new ApolloApiClient("test").filtersToApiBody(parsed.filters);
    expect(body).toMatchObject({
      person_titles: ["CEO", "Founder"],
      organization_locations: ["United States", "Canada"],
      person_seniorities: ["owner"],
      q_keywords: "fintech",
      future_signals: ["hiring", "funding"],
      include_similar_titles: true
    });
  });

  it("ignores UI-only Apollo parameters and maps real URL payload exactly", () => {
    const parsed = new ApolloUrlParser().parse("https://app.apollo.io/#/people?page=1&personTitles[]=chief%20executive%20officer&recommendationConfigId=6a0d0a155813970001be6201");
    const body = new ApolloApiClient("test").filtersToApiBody(parsed.filters);
    expect(body).toEqual({
      person_titles: ["chief executive officer"],
      page: 1
    });
  });
});
