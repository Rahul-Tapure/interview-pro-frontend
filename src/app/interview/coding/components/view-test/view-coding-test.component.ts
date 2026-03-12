// view-coding-test.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CodingCreatorService } from '../../service/coding-creator.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-coding-test.html',
  styleUrls: ['./view-coding-test.css']
})
export class ViewCodingTestComponent implements OnInit {

  testId!: number;
  test: any;
  questions: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private service: CodingCreatorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    // Load test details
    this.service.getTestById(this.testId).subscribe(res => {
      this.test = res;
      this.cdr.detectChanges();
    });

    // Load questions with test cases
    this.service.getQuestionsByTest(this.testId).subscribe(res => {
      // Sort by question index
      this.questions = res.sort(
        (a: any, b: any) => a.questionIndex - b.questionIndex
      );
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}