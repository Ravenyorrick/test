import { describe, expect, it } from "vitest";
import { PaginationDetector } from "@/extractors/paginationDetector";

describe("PaginationDetector", () => {
  it("detects current page, last page, and enabled next button", () => {
    document.body.innerHTML = `
      <nav>
        <span>Page 2 of 5</span>
        <button aria-label="Go to next page">Next</button>
      </nav>
    `;
    expect(new PaginationDetector().detect(document)).toMatchObject({
      currentPage: 2,
      lastPage: 5,
      canGoNext: true,
      nextSelector: "[aria-label=\"Go to next page\"]"
    });
  });

  it("recognizes disabled next button on final page", () => {
    document.body.innerHTML = `<span>Page 5 of 5</span><button aria-label="Next" disabled>Next</button>`;
    expect(new PaginationDetector().detect(document).canGoNext).toBe(false);
  });
});
