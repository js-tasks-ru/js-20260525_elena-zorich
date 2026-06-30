import { createElement } from "../../shared/utils/create-element";
import { required } from "../../shared/utils/required";

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
  private _element: HTMLElement | null = null;
  headersConfig: SortableTableHeader[];
  data: SortableTableData[];
  constructor(
    headersConfig: SortableTableHeader[] = [],
    data: SortableTableData[] = [],
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this._element = this.render();
  }

  render(): HTMLDivElement {
    return createElement(this.template()) as HTMLDivElement;
  }

  get element(): HTMLElement{
    return required(
      this._element,
      "Element has been destroyed or not rendered",
    )
  }

  private sub<T extends Element = HTMLElement>(selector: string): T {
    return required(
      this.element?.querySelector<T>(selector),
      `Element "${selector}" not found`,
    );
  }

  template(): string {
    return `
      <div class="sortable-table">FF
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
        ${
          sortable
            ? `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
        `
            : ""
        }
      </div>
    `;
  }

  getTableRows(data: SortableTableData[]): string {
    return data
      .map(
        (item) => `
      <a href="/products/${item.id}" class="sortable-table__row">
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

    const body = this.sub<HTMLDivElement>('[data-element="body"]');
    body.innerHTML = this.getTableRows(sortedData);

    this.element
      ?.querySelectorAll<HTMLDivElement>("[data-id]")
      .forEach((cell) => cell.removeAttribute("data-order"));

    const headerCell = this.sub<HTMLDivElement>(`[data-id="${field}"]`);
    headerCell.dataset.order = order;
  }

  remove() {
    this._element?.remove();
  }

  destroy() {
    this.remove();
    this._element = null;
  }
}
