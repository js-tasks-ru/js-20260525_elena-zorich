type SortOrder = "asc" | "desc";

type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number";
  template?: (value: string | number) => string;
}

export default class SortableTable {
  element: HTMLDivElement | null = null;
  headersConfig: SortableTableHeader[];
  data: SortableTableData[];
  constructor(
    headersConfig: SortableTableHeader[] = [],
    data: SortableTableData[] = [],
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.element = this.render();
  }

  render(): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template();
    return wrapper.firstElementChild as HTMLDivElement;
  }

  template(): string {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headersConfig.map((item) => this.getHeaderCell(item)).join("")}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getTableRows(this.data)}
        </div>
      </div>
    `;
  }

  getHeaderCell({ id, title, sortable = false }: SortableTableHeader): string {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
      </div>
    `;
  }

  getTableRows(data: SortableTableData[]): string {
    return data
      .map(
        (item) => `
      <a href="#" class="sortable-table__row">
        ${this.headersConfig
          .map(({ id, template }) => {
            const cellData = item[id];
            return template
              ? template(cellData)
              : `<div class="sortable-table__cell">${cellData}</div>`;
          })
          .join("")}
      </a>
    `,
      )
      .join("");
  }

  sort(field: string, order: SortOrder = "asc") {
    const col = this.headersConfig.find((c) => c.id === field);
    if (!col || !col.sortable) return;

    const direction = order === "asc" ? 1 : -1;

    const sortedData = [...this.data].sort((a, b) => {
      if (col.sortType === "number") {
        return direction * ((a[field] as number) - (b[field] as number));
      }
      return (
        direction *
        (a[field] as string).localeCompare(b[field] as string, ["ru", "en"], {
          caseFirst: "upper",
        })
      );
    });

    const body = this.element!.querySelector(
      '[data-element="body"]',
    ) as HTMLDivElement;
    body.innerHTML = this.getTableRows(sortedData);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
