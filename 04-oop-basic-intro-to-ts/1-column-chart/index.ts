import { createElement } from "../../shared/utils/create-element";

interface Options {
  data?: number[];
  label?: string;
  value?: number;
  link?: string;
  formatHeading?: (value: number) => string;
}

export default class ColumnChart {
  element: HTMLDivElement | null = null;
  chartHeight = 50;
  label: string;
  value: number | string;
  link: string;
  data: number[];
  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading,
  }: Options = {}) {
    this.label = label;
    this.value = formatHeading ? formatHeading(value) : value;
    this.link = link;
    this.data = data;
    this.element = createElement(this.template()) as HTMLDivElement;
  }

  update(data: number[]) {
    if (!this.element) return;
    this.element.querySelector('[data-element="body"]')!.innerHTML =
      this.getColumnBody(data);
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

  getColumnBody(data: number[]): string {
    const scale = this.chartHeight / Math.max(...data);
    let chartData = "";

    data.forEach((item) => {
      const percent = ((item / Math.max(...data)) * 100).toFixed(0);
      const value = Math.floor(item * scale);
      chartData += `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
    });
    return chartData;
  }

  private template(): string {
    return `
        <div class="column-chart ${!this.data.length ? "column-chart_loading" : ""}" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
          ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ""}
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
              ${this.value}
            </div>
            <div data-element="body" class="column-chart__chart">
              ${this.getColumnBody(this.data)}
            </div>
          </div>
        </div>
    `;
  }
}
