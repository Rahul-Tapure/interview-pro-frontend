// test-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { McqCommonService } from '../../services/mcq-common.service';
import { Test } from '../../models/test.model';

@Component({
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  styleUrls: ['./test-list.component.css'],
  templateUrl: './test-list.component.html'
})
export class TestListComponent implements OnInit {

  tests$!: Observable<Test[]>;
  testType!: 'APTITUDE' | 'TECHNICAL' | 'CODING';

  constructor(
    private route: ActivatedRoute,
    private commonService: McqCommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const typeParam = this.route.snapshot.paramMap.get('type');
    this.testType = typeParam?.toUpperCase() as 'APTITUDE' | 'TECHNICAL' | 'CODING';
    this.tests$ = this.commonService.getAllPublicTestsByType(this.testType);
  }

  /** Emoji shown in the eyebrow next to the round type */
  get typeIcon(): string {
    const icons: Record<string, string> = {
      APTITUDE:  '🔢',
      TECHNICAL: '💻',
      CODING:    '⚡',
    };
    return icons[this.testType] ?? '📋';
  }

  start(testId: number): void {
    this.router.navigate(['home', this.testType.toLowerCase(), 'tests', testId]);
  }
}