export const PAGE_HELPERS_SCRIPT = `
(() => {
  const clean = (value) => String(value || "").replace(/\\s+/g, " ").trim();
  const uniqueHeaders = (headers) => {
    const seen = new Map();
    return headers.map((header, index) => {
      const base = header || "Column " + (index + 1);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return count === 0 ? base : base + " " + (count + 1);
    });
  };
  const cells = (row) => Array.from(new Set(["th","td","[role='columnheader']","[role='gridcell']","[role='cell']"].flatMap((selector) => Array.from(row.querySelectorAll(selector)))));
  const extractLinks = (row) => Array.from(row.querySelectorAll("a[href]")).map((link, index) => {
    const label = clean(link.textContent) || "Link " + (index + 1);
    return [label + " URL", link.href];
  }).filter(([, href]) => href);

  window.__apolloExtractDom = () => {
    const tableSelectors = ["table", "[role='table']", "[role='grid']", "[data-testid*='table' i]", "[class*='table' i]", "[class*='grid' i]"];
    const rowSelectors = ["tr", "[role='row']", "[data-testid*='row' i]", "[class*='row' i]"];
    const candidates = tableSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
    const table = candidates.map((element) => {
      const rows = rowSelectors.flatMap((selector) => Array.from(element.querySelectorAll(selector)));
      return { element, score: rows.length + clean(element.textContent).length / 1000 };
    }).sort((a, b) => b.score - a.score)[0]?.element;
    if (!table) {
      const rows = Array.from(document.querySelectorAll("article,[data-testid*='card' i],[class*='card' i]"))
        .filter((element) => clean(element.textContent).length > 20)
        .map((element, index) => ({ fields: { ["Card " + (index + 1)]: clean(element.textContent) }, visibleText: clean(element.textContent) }));
      return { headers: [], rows };
    }
    const rows = Array.from(new Set(rowSelectors.flatMap((selector) => Array.from(table.querySelectorAll(selector))))).filter((row) => clean(row.textContent));
    const semanticHeaders = Array.from(table.querySelectorAll("th,[role='columnheader']")).map((cell) => clean(cell.textContent)).filter(Boolean);
    const headerRow = rows.find((row) => {
      const rowCells = cells(row);
      return rowCells.length > 1 && rowCells.every((cell) => ["TH", "DIV", "SPAN"].includes(cell.tagName));
    });
    const headers = uniqueHeaders((semanticHeaders.length > 1 ? semanticHeaders : (headerRow ? cells(headerRow).map((cell) => clean(cell.textContent)) : [])).filter(Boolean));
    const dataRows = rows.filter((row) => {
      const rowCells = cells(row);
      const cellTexts = rowCells.map((cell) => clean(cell.textContent)).filter(Boolean);
      return clean(row.textContent) && rowCells.length >= 2 && (headers.length === 0 || cellTexts.join("|") !== headers.join("|"));
    });
    return {
      headers,
      rows: dataRows.map((row) => {
        const fields = {};
        cells(row).filter((cell) => clean(cell.textContent)).forEach((cell, index) => {
          const header = clean(cell.getAttribute("data-column") || cell.getAttribute("aria-label") || headers[index] || "Column " + (index + 1));
          const text = clean(cell.textContent);
          const title = clean(cell.getAttribute("title"));
          fields[header] = title.length > text.length ? title : text;
        });
        extractLinks(row).forEach(([key, value]) => { fields[key] = value; });
        return { fields, visibleText: clean(row.textContent) };
      }).filter((row) => Object.keys(row.fields).length > 0)
    };
  };

  window.__apolloDetectPagination = () => {
    const text = clean(document.body?.innerText || "");
    const match = text.match(/page\\s+(\\d+)\\s+(?:of|\\/)\\s+(\\d+)/i);
    const selected = document.querySelector("[aria-current='page'],[data-selected='true'],.active");
    const currentPage = match ? Number(match[1]) : (Number(selected?.textContent?.trim()) || 1);
    const numbers = Array.from(document.querySelectorAll("button,a,[role='button']")).map((element) => Number(element.textContent?.trim())).filter((value) => Number.isFinite(value) && value > 0);
    const lastPage = match ? Number(match[2]) : (numbers.length ? Math.max(...numbers) : undefined);
    const hints = ["next", "go to next", "right", "pagination-next"];
    const next = Array.from(document.querySelectorAll("button,a,[role='button']")).find((element) => {
      const haystack = [element.getAttribute("aria-label"), element.getAttribute("data-testid"), element.getAttribute("title"), element.textContent].join(" ").toLowerCase();
      return hints.some((hint) => haystack.includes(hint));
    });
    const disabled = !next || next.hasAttribute("disabled") || next.getAttribute("aria-disabled") === "true" || String(next.className).toLowerCase().includes("disabled");
    const escaped = (value) => (window.CSS && CSS.escape ? CSS.escape(value) : String(value).replace(/"/g, "\\\\\\""));
    const selector = next?.getAttribute("data-testid") ? "[data-testid=\\"" + escaped(next.getAttribute("data-testid")) + "\\"]" : (next?.getAttribute("aria-label") ? "[aria-label=\\"" + escaped(next.getAttribute("aria-label")) + "\\"]" : next?.tagName.toLowerCase());
    return { currentPage, lastPage, canGoNext: Boolean(next && !disabled) && (!lastPage || currentPage < lastPage), nextSelector: selector };
  };
})();
`;
