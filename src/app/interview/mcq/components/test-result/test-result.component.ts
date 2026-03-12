// test-result.component.ts
import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.css']
})
export class TestResultComponent {

  result = history.state;
  
  constructor(
    private router: Router,
    private location: Location
  ) {
    this.location.replaceState('/result');
  }

  /** Score as a percentage (0–100) */
  get scorePercent(): number {
    if (!this.result?.totalQuestions) return 0;
    return Math.round((this.result.score / this.result.totalQuestions) * 100);
  }

  /**
   * SVG ring stroke-dashoffset.
   * Circumference = 2 * π * r = 2 * π * 52 ≈ 327
   * offset = circumference * (1 - pct)
   */
  get ringOffset(): number {
    const circumference = 327;
    return circumference * (1 - this.scorePercent / 100);
  }

  goToTests(): void {
    this.router.navigate(['home/technical/tests'], { replaceUrl: true });
  }

  goToHome(): void {
    this.router.navigate(['/dashboard/user'], { replaceUrl: true });
  }
}