// coding-workspace.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map, switchMap, tap, catchError, of } from 'rxjs';

import { CodingCreatorService } from '../../service/coding-creator.service';
import { CodingStudentService } from '../../service/coding-student.service';
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

<!-- ══ RESULTS SCREEN ══ -->
<div class="results-wrapper" *ngIf="completed">
  <div class="results-card">
    <div class="results-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </div>
    <h2 class="results-title">Test Completed!</h2>
    <p class="results-sub">You've submitted all {{ questionResults.length }} question{{ questionResults.length !== 1 ? 's' : '' }}</p>

    <div class="results-stats">
      <div class="rstat">
        <span class="rstat-num rstat-passed">{{ passedCount }}</span>
        <span class="rstat-label">Passed</span>
      </div>
      <div class="rstat">
        <span class="rstat-num rstat-failed">{{ failedCount }}</span>
        <span class="rstat-label">Failed</span>
      </div>
      <div class="rstat">
        <span class="rstat-num rstat-total">{{ questionResults.length }}</span>
        <span class="rstat-label">Total</span>
      </div>
    </div>

    <div class="results-list">
      <div class="ritem" *ngFor="let qr of questionResults; let i = index">
        <div class="ritem-left">
          <span class="ritem-num">Q{{ i + 1 }}</span>
          <span class="ritem-title">{{ qr.title }}</span>
        </div>
        <div class="ritem-right">
          <span class="ritem-score">{{ qr.passed }}/{{ qr.total }}</span>
          <span class="ritem-badge" [class.rbadge-pass]="qr.status === 'PASSED'" [class.rbadge-fail]="qr.status !== 'PASSED'">
            {{ qr.status }}
          </span>
        </div>
      </div>
    </div>

    <div class="results-actions">
      <button class="btn-dashboard" (click)="goToDashboard()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
        Dashboard
      </button>
      <button class="btn-home" (click)="goToHome()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Home
      </button>
    </div>
  </div>
</div>

<div class="workspace-layout" *ngIf="questions$ | async as questions" [class.hidden]="completed">

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
  questionsCache: CodingQuestion[] = [];
  currentIndex = 0;
  output = '';
  currentLanguageId = 62;
  completed = false;
  attemptId = '';

  questionResults: { title: string; status: string; passed: number; total: number }[] = [];

  private codeStore: Record<number, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CodingCreatorService,
    private studentService: CodingStudentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.questions$ = this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(testId =>
        this.studentService.startAttempt(testId).pipe(
          tap(res => {
            this.attemptId = res.attemptId;
            console.log('Attempt started:', this.attemptId);
          }),
          catchError(err => {
            console.error('Failed to start attempt, using local ID', err);
            this.attemptId = crypto.randomUUID();
            return of(null);
          }),
          switchMap(() => this.service.getQuestionsByTest(testId))
        )
      )
    );

    this.questions$.subscribe(q => this.questionsCache = q);
  }

  get passedCount(): number {
    return this.questionResults.filter(r => r.status === 'PASSED').length;
  }

  get failedCount(): number {
    return this.questionResults.filter(r => r.status !== 'PASSED').length;
  }

  next(total: number) {
    if (this.currentIndex < total - 1) this.currentIndex++;
  }

  prev() {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard/user']);
  }

  goToHome() {
    this.router.navigate(['/']);
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
    this.http.post<any>('/interviewpro/coding/run', {
      sourceCode: code, 
      languageId: this.currentLanguageId,
      input
    }, { withCredentials: true }).subscribe({
      next: res  => { 
        this.output = JSON.stringify(res, null, 2);
        this.cdr.detectChanges();
      },
      error: ()  => { 
        this.output = JSON.stringify({
          status: { id: 0, description: 'Backend Error' },
          message: 'Failed to connect to execution server'
        }, null, 2);
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(code: string, question: CodingQuestion) {
    this.codeStore[question.questionId] = code;
    this.output = 'Submitting...';
    this.http.post<any>('/interviewpro/coding/submit', {
      questionId: question.questionId, 
      sourceCode: code, 
      languageId: this.currentLanguageId,
      attemptId: this.attemptId
    }, {
      withCredentials: true
    }).subscribe({
      next: res  => { 
        this.output = JSON.stringify(res, null, 2);

        this.questionResults.push({
          title: question.title,
          status: res.status || 'SUBMITTED',
          passed: res.passed || 0,
          total: res.total || 0
        });

        if (this.currentIndex < this.questionsCache.length - 1) {
          setTimeout(() => {
            this.currentIndex++;
            this.output = '';
            this.cdr.detectChanges();
          }, 1500);
        } else {
          setTimeout(() => {
            this.completed = true;
            this.cdr.detectChanges();
          }, 1500);
        }

        this.cdr.detectChanges();
      },
      error: (err)  => { 
        console.error('Submit error:', err);
        this.output = JSON.stringify({
          status: { id: 0, description: 'Submit Failed' },
          message: err.status === 401 
            ? 'Authentication required. Please log in.' 
            : err.error?.message || 'Failed to submit to server'
        }, null, 2);
        this.cdr.detectChanges();
      }
    });
  }
}