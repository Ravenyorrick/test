export interface PaginationState {
  currentPage: number;
  lastPage?: number;
  canGoNext: boolean;
  nextSelector?: string;
}

const NEXT_HINTS = ["next", "go to next", "right", "pagination-next"];

export class PaginationDetector {
  detect(root: ParentNode = document): PaginationState {
    const text = (document.body?.innerText ?? "").replace(/\s+/g, " ");
    const currentPage = this.detectCurrentPage(text);
    const lastPage = this.detectLastPage(text);
    const next = this.findNextButton(root);

    return {
      currentPage,
      lastPage,
      canGoNext: Boolean(next && !this.isDisabled(next)) && (!lastPage || currentPage < lastPage),
      nextSelector: next ? this.selectorFor(next) : undefined
    };
  }

  private detectCurrentPage(text: string): number {
    const pagePattern = text.match(/page\s+(\d+)\s+(?:of|\/)\s+(\d+)/i);
    if (pagePattern) return Number(pagePattern[1]);
    const selected = document.querySelector("[aria-current='page'],[data-selected='true'],.active");
    const selectedNumber = Number(selected?.textContent?.trim());
    return Number.isFinite(selectedNumber) && selectedNumber > 0 ? selectedNumber : 1;
  }

  private detectLastPage(text: string): number | undefined {
    const pagePattern = text.match(/page\s+(\d+)\s+(?:of|\/)\s+(\d+)/i);
    if (pagePattern) return Number(pagePattern[2]);
    const pageNumbers = Array.from(document.querySelectorAll("button,a,[role='button']"))
      .map((element) => Number(element.textContent?.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);
    return pageNumbers.length ? Math.max(...pageNumbers) : undefined;
  }

  private findNextButton(root: ParentNode): Element | null {
    const candidates = Array.from(root.querySelectorAll("button,a,[role='button']"));
    return candidates.find((element) => {
      const aria = element.getAttribute("aria-label") ?? "";
      const testId = element.getAttribute("data-testid") ?? "";
      const title = element.getAttribute("title") ?? "";
      const text = element.textContent ?? "";
      const haystack = `${aria} ${testId} ${title} ${text}`.toLowerCase();
      return NEXT_HINTS.some((hint) => haystack.includes(hint));
    }) ?? null;
  }

  private isDisabled(element: Element): boolean {
    return (
      element.hasAttribute("disabled") ||
      element.getAttribute("aria-disabled") === "true" ||
      element.className.toString().toLowerCase().includes("disabled")
    );
  }

  private selectorFor(element: Element): string {
    const testId = element.getAttribute("data-testid");
    if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
    const aria = element.getAttribute("aria-label");
    if (aria) return `[aria-label="${CSS.escape(aria)}"]`;
    return element.tagName.toLowerCase();
  }
}
