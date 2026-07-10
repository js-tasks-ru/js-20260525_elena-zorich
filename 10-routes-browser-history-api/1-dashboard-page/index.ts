import ColumnChart from '../../08-async-code-fetch-api/1-column-chart/index';
import SortableTable from '../../08-async-code-fetch-api/2-sortable-table-v3/index';
import RangePicker from '../../07-forms-fetch-api/2-range-picker/index';

import header from './bestsellers-header';
import { createElement } from '../../shared/utils/create-element';
import { required } from '../../shared/utils/required';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  private _element: HTMLElement | null = null;

  get element(): HTMLElement {
    return required(this._element, 'Page element is not initialized');
  }

  private components: {
    sortableTable?: SortableTable;
    ordersChart?: ColumnChart;
    salesChart?: ColumnChart;
    customersChart?: ColumnChart;
    rangePicker?: RangePicker;
  } = {};

  private onDateSelect = (event: Event): void => {
    const { from, to } = (event as CustomEvent<{ from: Date; to: Date }>).detail;
    this.components.ordersChart?.update(from, to);
    this.components.salesChart?.update(from, to);
    this.components.customersChart?.update(from, to);
  };

  async render(): Promise<HTMLElement> {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);

    this._element = createElement(this.template());

    const rangePicker = new RangePicker({ from, to });
    const ordersChart = new ColumnChart({ url: 'api/dashboard/orders', label: 'Orders' });
    const salesChart = new ColumnChart({ url: 'api/dashboard/sales', label: 'Sales' });
    const customersChart = new ColumnChart({ url: 'api/dashboard/customers', label: 'Customers' });
    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      sorted: { id: 'title', order: 'asc' },
    });

    this.components = { rangePicker, ordersChart, salesChart, customersChart, sortableTable };

    this._element.querySelector('[data-element="rangePicker"]')!.append(required(rangePicker.element, 'RangePicker element not initialized'));
    this._element.querySelector('[data-element="ordersChart"]')!.append(ordersChart.element);
    this._element.querySelector('[data-element="salesChart"]')!.append(salesChart.element);
    this._element.querySelector('[data-element="customersChart"]')!.append(customersChart.element);
    this._element.querySelector('[data-element="sortableTable"]')!.append(sortableTable.element);

    this._element.addEventListener('date-select', this.onDateSelect);

    ordersChart.update(from, to);
    salesChart.update(from, to);
    customersChart.update(from, to);

    return this._element;
  }

  remove(): void {
    this._element?.remove();
  }

  destroy(): void {
    this.remove();
    this._element?.removeEventListener('date-select', this.onDateSelect);
    for (const component of Object.values(this.components)) {
      component?.destroy();
    }
    this._element = null;
  }

  private template(): string {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best Sellers</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }
}
