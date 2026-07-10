import { fetchJson } from "../../shared/utils/fetch-json";
import { createElement } from "../../shared/utils/create-element";

const BACKEND_URL = 'https://course-js.javascript.ru';

interface Options {
  url?: string;
  label?: string;
  link?: string;
  formatHeading?: (value: number) => string;
}

export default class ColumnChart {
  element: HTMLElement;
  chartHeight = 50;

  private label: string;
  private link: string;
  private url: URL;

  constructor({
    url = '',
    label = '',
    link = '',
  }: Options = {}) {
    this.label = label;
    this.link = link;
    this.url = new URL(url, BACKEND_URL);
    this.element = createElement(this.template());
  }

  async update(from: Date, to: Date): Promise<Record<string, number>> {
    this.element.classList.add('column-chart_loading');

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson<Record<string, number>>(this.url.toString());

    const body = this.element.querySelector<HTMLElement>('[data-element="body"]')!;
    body.innerHTML = this.getColumnBody(data);

    this.element.classList.toggle('column-chart_loading', Object.keys(data).length === 0);

    return data;
  }

  destroy(): void {
    this.element.remove();
  }

  private getColumnBody(data: Record<string, number>): string {
    const values = Object.values(data);
    const max = Math.max(...values);
    if (max === 0) return '';
    const scale = this.chartHeight / max;
    return values
      .map(v => {
        const percent = ((v / max) * 100).toFixed(0);
        return `<div style="--value: ${Math.floor(v * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  private template(): string {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }
}
