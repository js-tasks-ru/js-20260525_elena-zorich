import { createElement } from "../../shared/utils/create-element";
import { required } from "../../shared/utils/required";
import { fetchJson } from "../../shared/utils/fetch-json";

const BACKEND_URL = 'https://course-js.javascript.ru';

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, unknown>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'custom';
  template?: (value: unknown) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  url?: string;
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
  step?: number;
  start?: number;
  end?: number;
}

export default class SortableTable {
  element: HTMLElement;
  headersConfig: SortableTableHeader[];
  data: SortableTableData[] = [];
  url: string;
  sorted: SortableTableSort;
  isSortLocally: boolean;
  step: number;
  start: number;
  end: number;

  private isLoading = false;

  private onScroll = async (): Promise<void> => {
    const { bottom } = this.element.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;

    if (bottom < viewportHeight && !this.isLoading && !this.isSortLocally) {
      this.isLoading = true;

      this.start = this.end;
      this.end = this.start + this.step;

      const data = await this.loadData(this.sorted, this.start, this.end);

      this.data = [...this.data, ...data];
      this.sub('[data-element="body"]').insertAdjacentHTML('beforeend', this.getTableRows(data));

      this.isLoading = false;
    }
  };

  private onHeaderClick = (event: MouseEvent): void => {
    const column = (event.target as HTMLElement).closest<HTMLElement>('[data-sortable="true"]');
    if (!column) return;

    const field = required(column.dataset.id, 'Column missing data-id');
    const isSameColumn = field === this.sorted.id;
    const order: SortOrder = isSameColumn && this.sorted.order === 'asc' ? 'desc' : 'asc';

    this.sorted = { id: field, order };
    this.updateSortHighlight(field, order);

    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  };

  private updateSortHighlight(field: string, order: SortOrder): void {
    this.element
      .querySelectorAll<HTMLElement>('.sortable-table__cell[data-id]')
      .forEach((cell) => cell.removeAttribute('data-order'));

    const activeCell = this.sub<HTMLElement>(`.sortable-table__cell[data-id="${field}"]`);
    activeCell.dataset.order = order;
  }

  constructor(headersConfig: SortableTableHeader[] = [], {
    url = '',
    sorted = { id: '', order: 'asc' },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step,
  }: Options = {}) {
    this.headersConfig = headersConfig;
    this.url = url;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.element = createElement(this.template());

    this.sub('[data-element="header"]').addEventListener('pointerdown', this.onHeaderClick);
    window.addEventListener('scroll', this.onScroll);

    this.render();
  }

  private sub<T extends HTMLElement = HTMLElement>(selector: string): T {
    return required(
      this.element.querySelector<T>(selector),
      `Element "${selector}" not found`,
    );
  }

  private getHeaderCells(): string {
    return this.headersConfig
      .map(({ id, title, sortable = false }) => {
        const order = this.sorted.id === id ? this.sorted.order : '';
        const arrow = sortable
          ? `<span data-element="arrow" class="sortable-table__sort-arrow">
               <span class="sort-arrow"></span>
             </span>`
          : '';

        return `
          <div class="sortable-table__cell"
               data-id="${id}"
               data-sortable="${sortable}"
               ${order ? `data-order="${order}"` : ''}>
            <span>${title}</span>
            ${arrow}
          </div>
        `;
      })
      .join('');
  }

  private getTableRows(data: SortableTableData[]): string {
    return data
      .map((item) => `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.headersConfig
            .map(({ id, template }) => {
              return template
                ? template(item[id])
                : `<div class="sortable-table__cell">${item[id]}</div>`;
            })
            .join('')}
        </a>
      `)
      .join('');
  }

  private template(): string {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderCells()}
        </div>
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `;
  }

  async loadData(
    sort: SortableTableSort,
    start: number,
    end: number,
  ): Promise<SortableTableData[]> {
    const url = new URL(this.url, BACKEND_URL);

    url.searchParams.set('_sort', sort.id);
    url.searchParams.set('_order', sort.order);
    url.searchParams.set('_start', String(start));
    url.searchParams.set('_end', String(end));

    return fetchJson<SortableTableData[]>(url.toString());
  }

  async render(): Promise<void> {
    this.element.classList.add('sortable-table_loading');

    const data = await this.loadData(this.sorted, this.start, this.end);

    this.data = data;
    this.sub('[data-element="body"]').innerHTML = this.getTableRows(data);

    this.element.classList.remove('sortable-table_loading');
    this.element.classList.toggle('sortable-table_empty', data.length === 0);
  }

  sortOnClient(field: string, order: SortOrder): void {
    const col = this.headersConfig.find((c) => c.id === field);
    if (!col) return;

    const direction = order === 'asc' ? 1 : -1;

    const sorted = [...this.data].sort((a, b) => {
      switch (col.sortType) {
        case 'number':
          return direction * ((a[field] as number) - (b[field] as number));
        case 'string':
          return direction * (a[field] as string).localeCompare(
            b[field] as string,
            ['ru', 'en'],
            { caseFirst: 'upper' },
          );
        case 'custom':
          return direction * (col.customSorting ? col.customSorting(a, b) : 0);
        default:
          return 0;
      }
    });

    this.sub('[data-element="body"]').innerHTML = this.getTableRows(sorted);
  }

  sortOnServer(field: string, order: SortOrder): void {
    this.start = 1;
    this.end = this.start + this.step;
    this.render();
  }

  remove(): void {
    this.element.remove();
  }

  destroy(): void {
    this.sub('[data-element="header"]').removeEventListener('pointerdown', this.onHeaderClick);
    window.removeEventListener('scroll', this.onScroll);
    this.remove();
  }
}
