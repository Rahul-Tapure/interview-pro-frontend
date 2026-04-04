// resume-result.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-resume-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-result.component.html',
  styleUrls: ['./resume-result.component.css']
})
export class ResumeResultComponent {

  result: any;
  resultId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.resultId = this.route.snapshot.paramMap.get('id');

    if (this.resultId) {
      this.http.get(`/api/resume/${this.resultId}`)
        .subscribe({
          next: (res: any) => {
            this.result = res;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed to load resume result:', err);
            // Optionally redirect back if result not found
            // this.router.navigate(['/resume']);
          }
        });
    }
  }

  /** Navigate back to resume dashboard */
  goBack(): void {
    this.router.navigate(['/resume']);
  }

  /** Download report as PDF (implement your backend endpoint) */
  downloadReport(): void {
    if (!this.resultId) return;

    // Option 1: Download from backend endpoint
    //window.open(`/api/resume/${this.resultId}/download`, '_blank');

    // Option 2: Or use HttpClient to get blob and trigger download
    this.http.get(`/api/resume/${this.resultId}/download`, {
      responseType: 'blob'
    }).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-analysis-${this.resultId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}