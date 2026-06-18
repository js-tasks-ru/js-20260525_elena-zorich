import { createElement } from "../../shared/utils/create-element";

interface Options { 
  duration?: number;
  type?: NotificationType;
}

type NotificationType = "success" | "error" | "warning";

export default class NotificationMessage {
  static activeNotification: NotificationMessage | null = null;
  element: HTMLDivElement | null;
  duration: number;
  type: NotificationType;
  message: string;
  timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(message: string, { duration = 2000, type = "success" }: Options = {}) {
    this.duration = duration;
    this.type = type;
    this.message = message;
    this.element = createElement(this.template()) as HTMLDivElement;
  }

  show(target: HTMLElement = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    if (!this.element) return;
    target.append(this.element);

    NotificationMessage.activeNotification = this;

    this.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
      NotificationMessage.activeNotification = null;
    }
  }

  template(): string {
    return `
<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
  <div class="timer"></div>
  <div class="inner-wrapper">
    <div class="notification-header">${this.type}</div>
    <div class="notification-body">
      ${this.message}
    </div>
  </div>
</div>
    `;
  }

  destroy() {
    this.remove();
    if (this.timerId) clearTimeout(this.timerId);
    this.element = null;
  }
}
