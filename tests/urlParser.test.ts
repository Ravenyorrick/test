import { describe, expect, it } from "vitest";
import { ApolloUrlParser } from "@/parsers/urlParser";

describe("ApolloUrlParser", () => {
  it("parses arbitrary hash query parameters without known filter names", () => {
    const parsed = new ApolloUrlParser().parse("https://app.apollo.io/#/people?page=3&personTitles[]=owner&AI%20Score=high&futureFilter[]=alpha&futureFilter[]=beta");
    expect(parsed.page).toBe(3);
    expect(parsed.filters).toEqual(expect.arrayContaining([
      { key: "personTitles", values: ["owner"], isArray: true, rawKeys: ["personTitles[]"] },
      { key: "AI Score", values: ["high"], isArray: false, rawKeys: ["AI Score"] },
      { key: "futureFilter", values: ["alpha", "beta"], isArray: true, rawKeys: ["futureFilter[]", "futureFilter[]"] }
    ]));
  });

  it("sets page inside Apollo hash URLs", () => {
    expect(new ApolloUrlParser().setPage("https://app.apollo.io/#/people?page=1&x=y", 9)).toContain("#/people?page=9&x=y");
  });
});
