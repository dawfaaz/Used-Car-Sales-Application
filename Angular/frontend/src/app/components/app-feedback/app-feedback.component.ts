import { CommonModule } from "@angular/common";
import { Component, HostListener, inject } from "@angular/core";
import { UiFeedbackService } from "../../services/ui-feedback.service";

@Component({
  selector: "app-feedback",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./app-feedback.component.html",
  styleUrl: "./app-feedback.component.css",
})
export class AppFeedbackComponent {
  readonly feedback = inject(UiFeedbackService);

  @HostListener("document:keydown.escape")
  cancelConfirmation(): void {
    if (this.feedback.confirmation()) {
      this.feedback.resolveConfirm(false);
    }
  }
}
