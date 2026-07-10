import { createElement } from '../../shared/utils/create-element';
import { required } from '../../shared/utils/required';

export default class SortableList {
  private _element: HTMLElement | null = null;

  get element(): HTMLElement {
    return required(this._element, 'SortableList element is not initialized');
  }

  private draggingElem: HTMLElement | null = null;
  private placeholder: HTMLElement | null = null;
  private pointerShift = { x: 0, y: 0 };
  private prevPointer = { x: 0, y: 0 };

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;

    if (target.closest('[data-delete-handle]')) {
      target.closest('.sortable-list__item')?.remove();
      return;
    }

    if (target.closest('[data-grab-handle]')) {
      const item = target.closest<HTMLElement>('.sortable-list__item');
      if (item) {
        event.preventDefault();
        this.startDragging(item, event);
      }
      return;
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.draggingElem || !this.placeholder) return;

    this.draggingElem.style.left = `${event.clientX - this.pointerShift.x}px`;
    this.draggingElem.style.top = `${event.clientY - this.pointerShift.y}px`;

    const dx = event.clientX - this.prevPointer.x;
    const dy = event.clientY - this.prevPointer.y;

    if (dx !== 0 || dy !== 0) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / dist;
      const ny = dy / dist;
      this.draggingElem.style.boxShadow =
        `${-nx * 12}px ${-ny * 12}px 20px rgba(16, 156, 241, 0.7),` +
        `${-nx * 6}px ${-ny * 6}px 10px rgba(136, 90, 248, 0.5)`;
    }

    this.prevPointer = { x: event.clientX, y: event.clientY };

    this.movePlaceholder(event.clientY);
  };

  private onPointerUp = (): void => {
    if (!this.draggingElem || !this.placeholder) return;

    this.placeholder.replaceWith(this.draggingElem);

    this.draggingElem.classList.remove('sortable-list__item_dragging');
    this.draggingElem.style.left = '';
    this.draggingElem.style.top = '';
    this.draggingElem.style.width = '';
    this.draggingElem.style.boxShadow = '';

    this.draggingElem = null;
    this.placeholder = null;

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointercancel', this.onPointerUp);
  };

  private startDragging(item: HTMLElement, event: PointerEvent): void {
    const rect = item.getBoundingClientRect();

    this.pointerShift = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    this.prevPointer = { x: event.clientX, y: event.clientY };

    const placeholder = document.createElement('li');
    placeholder.className = 'sortable-list__placeholder';
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    this.placeholder = placeholder;

    item.before(placeholder);

    item.classList.add('sortable-list__item_dragging');
    item.style.width = `${rect.width}px`;
    item.style.left = `${rect.left}px`;
    item.style.top = `${rect.top}px`;

    this.draggingElem = item;

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointercancel', this.onPointerUp);
  }

  private movePlaceholder(cursorY: number): void {
    if (!this._element || !this.placeholder || !this.draggingElem) return;

    for (const child of this._element.children) {
      if (child === this.draggingElem || child === this.placeholder) continue;

      const { top, height } = child.getBoundingClientRect();
      if (cursorY < top + height / 2) {
        this._element.insertBefore(this.placeholder, child);
        return;
      }
    }

    this._element.append(this.placeholder);
  }

  constructor({ items = [] }: { items?: HTMLElement[] } = {}) {
    const el = createElement('<ul class="sortable-list"></ul>');
    this._element = el;

    for (const item of items) {
      item.classList.add('sortable-list__item');
      el.append(item);
    }

    el.addEventListener('pointerdown', this.onPointerDown);
  }

  remove() {
    this._element?.remove();
  }

  destroy() {
    this._element?.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointercancel', this.onPointerUp);
    this.remove();
    this._element = null;
  }
}
