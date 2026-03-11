// test-start.component.ts
import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { McqStudentService } from '../../services/mcq-student.service';
import { Question } from '../../models/question.model';
import {
  Observable, interval, map, switchMap,
  shareReplay, Subject, takeUntil
} from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-start.component.html',
  styleUrls: ['./test-start.component.css']
})
export class TestStartComponent implements OnDestroy {

  private route          = inject(ActivatedRoute);
  private studentService = inject(McqStudentService);
  private router         = inject(Router);
  private destroy$       = new Subject<void>();

  questions$!: Observable<Question[]>;

  attemptId!: number;
  answers: Record<number, number> = {};
  submitted = false;
  testTitle = '';

  /** Currently scrolled-to question index (for navigator highlight) */
  activeIndex = 0;

  testResponse$ = this.route.paramMap.pipe(
    map(p => Number(p.get('id'))),
    switchMap(id => this.studentService.startTest(id)),
    shareReplay(1)
  );

  /* ── Signal Timer ─────────────────────────────── */
  totalSeconds = signal(0);

  formattedTime = computed(() => {
    const t = this.totalSeconds();
    return `${this.pad(Math.floor(t / 3600))}:${this.pad(Math.floor((t % 3600) / 60))}:${this.pad(t % 60)}`;
  });

  constructor() {
    this.questions$ = this.testResponse$.pipe(map(res => res.questions));

    this.testResponse$.pipe(
      map(res => res.testName),
      takeUntil(this.destroy$)
    ).subscribe(name => { this.testTitle = name; });

    this.testResponse$.subscribe(res => {
      this.attemptId = res.attemptId;
      this.totalSeconds.set(res.durationMinutes * 60);
      this.startTimer();
    });
  }

  /* ── Computed Stats ───────────────────────────── */
  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }

  /* ── Option Letter ────────────────────────────── */
  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /* ── Navigator Helpers ────────────────────────── */
  scrollTo(index: number): void {
    this.activeIndex = index;
    const el = document.getElementById('q' + index);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isCurrentlyVisible(index: number): boolean {
    return this.activeIndex === index;
  }

  /* ── Timer ────────────────────────────────────── */
  startTimer(): void {
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.totalSeconds() > 0) {
        this.totalSeconds.update(v => v - 1);
      } else {
        this.autoSubmit();
      }
    });
  }

  /* ── Selection ────────────────────────────────── */
  select(questionId: number, optionId: number): void {
    if (!this.submitted) {
      this.answers = { ...this.answers, [questionId]: optionId };
      // advance activeIndex to next unanswered (UX convenience)
      const keys = Object.keys(this.answers).length;
      this.activeIndex = Math.min(keys, this.activeIndex + 1);
    }
  }

  /* ── Submit ───────────────────────────────────── */
  submit(): void {
    if (this.submitted) return;
    this.submitted = true;
    this.destroy$.next();

    this.studentService
      .submitTest(this.attemptId, this.answers)
      .subscribe(res => {
        this.router.navigate(['/result'], { state: res, replaceUrl: true });
      });
  }

  autoSubmit(): void {
    if (!this.submitted) {
      alert('⏰ Time is up! Submitting your test.');
      this.submit();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private pad(v: number): string {
    return v < 10 ? '0' + v : v.toString();
  }
}