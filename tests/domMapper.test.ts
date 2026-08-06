import { describe, expect, it } from "vitest";
import { DomMapper } from "@/extractors/domMapper";

describe("DomMapper", () => {
  it("maps rendered headers to cells and keeps future columns", () => {
    document.body.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Company</th><th>Intent Signal</th></tr></thead>
        <tbody>
          <tr><td><a href="https://linkedin.com/in/a">Ada Lovelace</a></td><td>Apollo</td><td>Hiring AI</td></tr>
          <tr><td>Grace Hopper</td><td>Navy</td><td>Cloud migration</td></tr>
        </tbody>
      </table>
    `;
    const result = new DomMapper().map(document);
    expect(result.headers).toEqual(["Name", "Company", "Intent Signal"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].fields).toMatchObject({ Name: "Ada Lovelace", Company: "Apollo", "Intent Signal": "Hiring AI" });
    expect(result.rows[0].fields["Ada Lovelace URL"]).toBe("https://linkedin.com/in/a");
  });
});
