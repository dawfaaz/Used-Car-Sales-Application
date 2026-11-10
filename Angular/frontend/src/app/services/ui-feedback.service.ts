import { Injectable, signal } from "@angular/core";

export type NotificationType = "success" | "error" | "info";

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
}

export interface ConfirmationRequest {
  title: string;
  message: string;
  confirmLabel: string;
}

@Injectable({ providedIn: "root" })
export class UiFeedbackService {
  readonly notifications = signal<AppNotification[]>([]);
  readonly confirmation = signal<ConfirmationRequest | null>(null);

  private nextNotificationId = 0;
  private resolveConfirmation?: (confirmed: boolean) => void;

  success(message: string): void {
    this.notify("success", message);
  }

  error(message: string): void {
    this.notify("error", message);
  }

  info(message: string): void {
    this.notify("info", message);
  }

  confirm(
    request: ConfirmationRequest,
  ): Promise<boolean> {
    if (this.resolveConfirmation) {
      this.resolveConfirmation(false);
    }

    this.confirmation.set(request);
    return new Promise<boolean>((resolve) => {
      this.resolveConfirmation = resolve;
    });
  }

  resolveConfirm(confirmed: boolean): void {
    this.confirmation.set(null);
    this.resolveConfirmation?.(confirmed);
    this.resolveConfirmation = undefined;
  }

  dismiss(notificationId: number): void {
    this.notifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== notificationId),
    );
  }

  private notify(type: NotificationType, message: string): void {
    const id = this.nextNotificationId++;
    this.notifications.update((notifications) => [
      ...notifications,
      { id, type, message },
    ]);

    window.setTimeout(() => this.dismiss(id), 5000);
  }
}
