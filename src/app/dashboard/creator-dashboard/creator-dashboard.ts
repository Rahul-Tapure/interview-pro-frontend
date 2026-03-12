// creator-dashboard.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { McqCreatorService } from '../../interview/mcq/services/mcq-creator.service';
import { CodingCreatorService } from '../../interview/coding/service/coding-creator.service';
import { CommunicationService } from '../../interview/communication/services/communication.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creator-dashboard.html',
  styleUrls: ['./creator-dashboard.css']
})
export class CreatorDashboardComponent implements OnInit {

  aptitudeTests$!: Observable<any[]>;
  technicalTests$!: Observable<any[]>;
  codingTests$!: Observable<any[]>;
  communicationTests$!: Observable<any[]>;

  message: string | null = null;

  constructor(
    private mcqService: McqCreatorService,
    private codingService: CodingCreatorService,
    private commService: CommunicationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.aptitudeTests$  = this.mcqService.getMyTestsByType('APTITUDE');
    this.technicalTests$ = this.mcqService.getMyTestsByType('TECHNICAL');
    this.codingTests$    = this.codingService.getMyCodingTests();
    this.communicationTests$ = this.commService.getMyTests();
    this.cdr.detectChanges();
  }

  private showMessage(msg: string): void {
    this.message = msg;
    setTimeout(() => (this.message = null), 4000);
  }

  /* ── Navigation ─────────────────────────────── */
  createTest(): void {
    this.router.navigate(['/creator/tests/create']);
  }

  createCoding(): void {
    this.router.navigate(['/creator/coding/create']);
  }

  /* ── MCQ Actions ────────────────────────────── */
  viewMcq(testId: number): void {
    this.router.navigate(['/creator/view/tests', testId]);
  }

  editMcq(testId: number): void {
    this.router.navigate(['/creator/tests', testId, 'edit']);
  }

  deleteMcq(testId: number): void {
    if (!confirm('Delete this test?')) return;
    this.mcqService.deleteTest(testId).subscribe(() => {
      this.showMessage('Test deleted successfully.');
      this.loadAll();
    });
  }

  publishMcq(testId: number): void {
    if (!confirm('Publish this test? It will be visible to all students.')) return;
    this.mcqService.publishTest(testId).subscribe(() => {
      this.showMessage('Test published successfully!');
      this.loadAll();
    });
  }

  /* ── Coding Actions ─────────────────────────── */
  viewCodingTest(testId: number): void {
    this.router.navigate(['/creator/coding/', testId, 'view']);
  }

  editCoding(id: number): void {
    this.router.navigate(
      ['/creator/coding/test', id],
      { queryParams: { step: 1 } }
    );
  }

  deleteCodingTest(testId: number): void {
    if (!confirm('Delete this entire coding test?')) return;
    this.codingService.deleteTest(testId).subscribe(() => {
      this.showMessage('Coding test deleted successfully.');
      this.loadAll();
    });
  }

  publishCodingTest(testId: number): void {
    if (!confirm('Publish this coding test? It will be visible to all students.')) return;
    this.codingService.publishTest(testId).subscribe(() => {
      this.showMessage('Coding test published successfully!');
      this.loadAll();
    });
  }

  /* ── Communication Actions ──────────────────── */
  createCommunication(): void {
    this.router.navigate(['/creator/communication/create']);
  }

  viewCommunication(testId: number): void {
    this.router.navigate(['/creator/communication', testId, 'view']);
  }

  editCommunication(testId: number): void {
    this.router.navigate(
      ['/creator/communication/test', testId],
      { queryParams: { step: 1 } }
    );
  }

  deleteCommunication(testId: number): void {
    if (!confirm('Delete this communication test?')) return;
    this.commService.deleteTest(testId).subscribe(() => {
      this.showMessage('Communication test deleted successfully.');
      this.loadAll();
    });
  }

  publishCommunication(testId: number): void {
    if (!confirm('Publish this communication test? It will be visible to all students.')) return;
    this.commService.publishTest(testId).subscribe(() => {
      this.showMessage('Communication test published successfully!');
      this.loadAll();
    });
  }
}