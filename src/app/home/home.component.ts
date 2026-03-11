// home.component.ts

import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {

  // ==============================
  // Resume Analyzer State
  // ==============================

  showResumeAnalyzer: boolean = false;

  roles: string = '';
  selectedFile: File | null = null;

  loading: boolean = false;
  error: string = '';
  result: any = null;
  showRaw: boolean = false;
  dragging: boolean = false;
  toast: string = '';

  // For circular score animation (if using SVG circle)
  circumference = 2 * Math.PI * 42;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ==============================
  // Getters
  // ==============================

  /** Get selected filename for display */
  get selectedFileName(): string {
    return this.selectedFile?.name || '';
  }

  // ==============================
  // File Handling
  // ==============================

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
      event.target.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'File size must be less than 5MB';
      this.selectedFile = null;
      event.target.value = '';
      return;
    }

    // File is valid
    this.selectedFile = file;
    this.error = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;

    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        this.error = 'Please upload a PDF, DOC, or DOCX file';
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.error = '';
    }
  }

  // ==============================
  // Utility Methods
  // ==============================

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getOffset(score: number): number {
    return this.circumference * (1 - score / 100);
  }

  scoreLabel(score: number): string {
    if (score >= 85) return 'Excellent match';
    if (score >= 70) return 'Good match';
    if (score >= 50) return 'Needs improvement';
    return 'Weak match';
  }

  scoreColor(score: number): string {
    if (score >= 75) return '#16a34a';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  }

  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => {
      this.toast = '';
    }, 3000);
  }

  // ==============================
  // Resume Analysis API Call
  // ==============================

  analyze(): void {
    // Validate inputs
    if (!this.selectedFile || !this.roles.trim()) {
      this.error = 'Please provide both a target role and resume file';
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('roles', this.roles.trim());

    // Uses Angular interceptor for JWT automatically
    this.http.post('http://localhost:8080/api/resume/analyze', formData)
      .subscribe({
        next: (response: any) => {
          this.result = response;
          this.showToast('✓ Analysis complete!');
          
          // Option: Navigate to result page instead of inline display
          // if (response.id) {
          //   this.router.navigate(['/resume/result', response.id]);
          // }
        },
        error: (err) => {
          if (err.status === 400) {
            this.error = err.error?.message || 'Invalid resume for the selected role.';
          } else if (err.status === 401 || err.status === 403) {
            this.error = 'Authentication required. Please login.';
          } else if (err.status === 0) {
            this.error = 'Cannot connect to server. Is backend running?';
          } else {
            this.error = `Server error (${err.status}). Please try again.`;
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  // ==============================
  // Toggle Resume Analyzer Section
  // ==============================

  toggleResumeAnalyzer(): void {
    this.showResumeAnalyzer = !this.showResumeAnalyzer;
    
    // Reset form when closing
    if (!this.showResumeAnalyzer) {
      this.roles = '';
      this.selectedFile = null;
      this.error = '';
      this.result = null;
    }
  }

  // ==============================
  // Navigate to Full Resume Page
  // ==============================

  goToResumePage(): void {
    this.router.navigate(['/resume']);
  }
}