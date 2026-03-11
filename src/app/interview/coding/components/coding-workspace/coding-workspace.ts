// coding-workspace.ts  –  replace the inline template with the full redesign
// (keep templateUrl if you prefer a separate file)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map, switchMap } from 'rxjs';

import { CodingCreatorService } from '../../service/coding-creator.service';
import { CodingQuestion } from '../../model/coding-question.model';
import { CodeEditorComponent } from '../code-editor/code-editor';

@Component({
  standalone: true,
  selector: 'app-coding-workspace',
  imports: [CommonModule, CodeEditorComponent, HttpClientModule],
  styleUrls: ['./coding-workspace.css'],
  template: `
<!-- Background -->
<div class="workspace-bg">
  <div class="grid-overlay"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
</div>

<!-- Loading -->
<div class="loading-wrapper" *ngIf="!(questions$ | async)">
  <div class="loading-card">
    <div class="loading-dots">
      <div class="ldot"></div><div class="ldot"></div><div class="ldot"></div>
    </div>
    <p class="loading-text">Loading coding test...</p>
  </div>
</div>

<div class="workspace-layout" *ngIf="questions$ | async as questions">

  <!-- ══ LEFT: Problem Panel ══ -->
  <div class="left-panel">

    <!-- Sticky Header -->
    <div class="panel-header">
      <div class="panel-top-row">
        <span class="q-counter">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
          Problem {{ currentIndex + 1 }} / {{ questions.length }}
        </span>
        <span class="diff-badge"
          [class.diff-easy]="questions[currentIndex].difficulty === 'EASY'"
          [class.diff-medium]="questions[currentIndex].difficulty === 'MEDIUM'"
          [class.diff-hard]="questions[currentIndex].difficulty === 'HARD'">
          {{ questions[currentIndex].difficulty }}
        </span>
      </div>
      <h1 class="q-title">{{ questions[currentIndex].title }}</h1>
      <div class="q-progress-track">
        <div class="q-progress-fill" [style.width]="((currentIndex + 1) / questions.length * 100) + '%'"></div>
      </div>
    </div>

    <!-- Scrollable Body -->
    <div class="panel-body">

      <!-- Description -->
      <div>
        <div class="section-label">Problem Statement</div>
        <p class="q-description">{{ questions[currentIndex].description }}</p>
      </div>

      <!-- Constraints -->
      <div *ngIf="questions[currentIndex].constraints">
        <div class="section-label">Constraints</div>
        <pre class="constraints-block">{{ questions[currentIndex].constraints }}</pre>
      </div>

      <!-- Sample Test Cases -->
      <div>
        <div class="section-label">Sample Test Cases</div>
        <div class="testcase-list">
          <div
            class="testcase-card"
            *ngFor="let tc of questions[currentIndex].testCases; let i = index">
            <div *ngIf="tc.sample">
              <div class="tc-header">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Example {{ i + 1 }}
              </div>
              <div class="tc-row">
                <span class="tc-key">Input</span>
                <code class="tc-val">{{ tc.input }}</code>
              </div>
              <div class="tc-row">
                <span class="tc-key">Output</span>
                <code class="tc-val">{{ tc.expectedOutput }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Sticky Nav -->
    <div class="panel-nav">
      <button class="btn-nav-ghost" (click)="prev()" [disabled]="currentIndex === 0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Previous
      </button>
      <button class="btn-nav-next" (click)="next(questions.length)" [disabled]="currentIndex === questions.length - 1">
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>

  </div>

  <!-- ══ RIGHT: Code Editor ══ -->
  <div class="right-panel">
    <app-code-editor
      class="h-full"
      [initialCode]="getInitialCode(questions[currentIndex])"
      [consoleOutput]="output"
      (run)="onRun($event, questions[currentIndex])"
      (submit)="onSubmit($event, questions[currentIndex])"
      (languageIdChange)="currentLanguageId = $event"
    ></app-code-editor>
  </div>

</div>
  `,
})
export class CodingWorkspaceComponent {

  questions$;
  currentIndex = 0;
  output = '';
  currentLanguageId = 62; // Track the selected language ID

  private codeStore: Record<number, string> = {};

  constructor(
    private route: ActivatedRoute,
    private service: CodingCreatorService,
    private http: HttpClient
  ) {
    this.questions$ = this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(testId => this.service.getQuestionsByTest(testId))
    );
  }

  next(total: number) {
    if (this.currentIndex < total - 1) this.currentIndex++;
  }

  prev() {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  getInitialCode(question: CodingQuestion): string {
    return (
      this.codeStore[question.questionId] ||
      `public class Main {\n  public static void main(String[] args) throws Exception {\n    java.util.Scanner sc = new java.util.Scanner(System.in);\n    // Write your solution here\n  }\n}`
    );
  }

  onRun(code: string, question: CodingQuestion) {
    this.codeStore[question.questionId] = code;
    const input = question.testCases?.find((tc: { sample: any }) => tc.sample)?.input || '';
    this.output = 'Running...';
    this.http.post<any>('http://localhost:8080/interviewpro/coding/run', {
      sourceCode: code, 
      languageId: this.currentLanguageId, // Use dynamic language ID
      input
    }).subscribe({
      next: res  => { 
        // Send full JSON response to console for rich display
        this.output = JSON.stringify(res, null, 2);
      },
      error: ()  => { 
        this.output = JSON.stringify({
          status: { id: 0, description: 'Backend Error' },
          message: 'Failed to connect to execution server'
        }, null, 2);
      }
    });
  }

  onSubmit(code: string, question: CodingQuestion) {
    this.codeStore[question.questionId] = code;
    this.output = 'Submitting...';
    this.http.post<any>('http://localhost:8080/interviewpro/coding/submit', {
      questionId: question.questionId, 
      sourceCode: code, 
      languageId: this.currentLanguageId
    }, {
      withCredentials: true // ✅ Send authentication cookies
    }).subscribe({
      next: res  => { 
        // Send full JSON response to console for rich display
        this.output = JSON.stringify(res, null, 2);
      },
      error: (err)  => { 
        console.error('Submit error:', err);
        this.output = JSON.stringify({
          status: { id: 0, description: 'Submit Failed' },
          message: err.status === 401 
            ? 'Authentication required. Please log in.' 
            : err.error?.message || 'Failed to submit to server'
        }, null, 2);
      }
    });
  }
}