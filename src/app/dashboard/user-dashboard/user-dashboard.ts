// user-dashboard.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { McqStudentService } from '../../interview/mcq/services/mcq-student.service';
import { CodingStudentService } from '../../interview/coding/service/coding-student.service';
import { CommunicationService } from '../../interview/communication/services/communication.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboardComponent implements OnInit {

  results: any[] = [];
  chart!: Chart;
  codingResults: any[] = [];
  commSubmissions: any[] = [];
  commLoading = true;

  constructor(
    private studentService: McqStudentService,
    private codingService: CodingStudentService,
    private communicationService: CommunicationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.loadAllResults();
  this.loadCommResults();
}
loadAllResults(): void {

  this.studentService.getMyResults().subscribe(mcq => {

    this.codingService.getMyCodingResults().subscribe(coding => {

      this.results = [...mcq, ...coding];

      this.cdr.detectChanges();
      this.renderChart();
    });
  });
}


  loadResults(): void {
    this.studentService.getMyResults().subscribe(res => {
      this.results = res;
      this.cdr.detectChanges();
      this.renderChart();
    });
  }
loadCodingResults(): void {
  this.codingService.getMyCodingResults().subscribe(res => {
    this.codingResults = res;
    this.mergeResultsForDashboard();
  });
}

mergeResultsForDashboard(): void {
  // backend already sends ResultResponse format
  this.results = [...this.results, ...this.codingResults];

  this.cdr.detectChanges();
  this.renderChart();
}

  // ── Computed stats ───────────────────────────────
  get passedCount(): number {
    return this.results.filter(r => r.passed).length;
  }

  get avgScore(): number {
    if (!this.results.length) return 0;
    const total = this.results.reduce((sum, r) =>
      sum + Math.round((r.score / r.totalQuestions) * 100), 0);
    return Math.round(total / this.results.length);
  }

  get passRate(): number {
    if (!this.results.length) return 0;
    return Math.round((this.passedCount / this.results.length) * 100);
  }

  // ── Chart ─────────────────────────────────────────
  renderChart(): void {
    if (this.chart) this.chart.destroy();
    if (!this.results.length) return;

    const scores = this.results.map(r =>
      Math.round((r.score / r.totalQuestions) * 100)
    );
    const labels = this.results.map((_, i) => `Test ${i + 1}`);

    this.chart = new Chart('scoreChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Score %',
          data: scores,
          borderColor: '#6366f1',
          backgroundColor: (ctx) => {
            const canvas = ctx.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(99,102,241,.25)');
            gradient.addColorStop(1, 'rgba(99,102,241,.0)');
            return gradient;
          },
          borderWidth: 2.5,
          tension: 0.45,
          fill: true,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#111827',
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a2236',
            borderColor: 'rgba(99,102,241,.3)',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            padding: 12,
            callbacks: {
              label: (ctx) => ` Score: ${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(99,102,241,.06)' },
            ticks: { color: '#475569', font: { size: 11 } },
            border: { color: 'rgba(99,102,241,.1)' }
          },
          y: {
            min: 0, max: 100,
            grid: { color: 'rgba(99,102,241,.06)' },
            ticks: {
              color: '#475569', font: { size: 11 },
              callback: (v) => `${v}%`
            },
            border: { color: 'rgba(99,102,241,.1)' }
          }
        }
      }
    });
  }

  takeTest(): void {
    this.router.navigate(['/tests']);
  }

  loadCommResults(): void {
    this.commLoading = true;
    this.communicationService.getCompletedSubmissions().subscribe({
      next: (subs) => {
        console.log('Comm submissions:', subs);
        this.commSubmissions = subs;
        this.commLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load comm results', err);
        this.commLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getCommStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-pass';
      case 'IN_PROGRESS': return 'badge-progress';
      default: return 'badge-fail';
    }
  }

  viewCommFeedback(submission: any): void {
    this.router.navigate(['/home/communication/result', submission.id]);
  }
}