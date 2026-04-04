import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-communication-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communication-result.component.html',
  styleUrls: ['./communication-result.component.css']
})
export class CommunicationResultComponent {
  @Input() submission: any | null = null;
  @Input() loading = false;
  @Input() title = 'Communication Result';
  @Input() subtitle = '';
  @Input() showHeader = true;
  @Input() showClose = false;
  @Output() close = new EventEmitter<void>();

  hasValue(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  closePanel(): void {
    this.close.emit();
  }
}
