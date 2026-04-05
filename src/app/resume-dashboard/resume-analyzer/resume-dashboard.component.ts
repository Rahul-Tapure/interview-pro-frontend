// resume-dashboard.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-resume-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-dashboard.component.html',
  styleUrls: ['./resume-dashboard.component.css']
})
export class ResumeDashboardComponent {

  roles = '';
  selectedFile: File | null = null;
  resumes: any[] = [];

  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {
    this.loadHistory();
  }

  /** Get selected filename for display in upload zone */
  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }

  /** Load user's resume analysis history */
  loadHistory(): void {
    this.http.get(`${environment.apiUrl}/api/resume/my`)
      .subscribe({
        next: (res: any) => {
          this.resumes = res;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load history:', err);
        }
      });
  }

  /** Handle file selection with validation */
  onFileChange(event: any): void {
    const file = event.target.files[0];
    
    if (!file) {
      this.selectedFile = null;
      this.error = '';
      return;
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      this.error = 'Please upload a PDF, DOC, or DOCX file';
      this.selectedFile = null;
      // Reset the file input
      event.target.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'File size must be less than 5MB';
      this.selectedFile = null;
      // Reset the file input
      event.target.value = '';
      return;
    }

    // File is valid
    this.selectedFile = file;
    this.error = '';
  }

  /** Navigate to resume result page */
  viewResult(id: number): void {
    this.router.navigate(['/resume/result', id]);
  }

  /** Analyze resume via backend API */
  analyze(): void {
    // Validate inputs
    if (!this.selectedFile || !this.roles.trim()) {
      this.error = 'Please provide both a target role and resume file';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('roles', this.roles.trim());

    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/api/resume/analyze`, formData)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.router.navigate(['/resume/result', res.id]);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Analysis failed. Please try again.';
        }
      });
  }
}