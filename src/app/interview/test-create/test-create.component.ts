// test-create.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';

import { McqCreatorService } from '../mcq/services/mcq-creator.service';
import { CodingCreatorService } from '../coding/service/coding-creator.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-create.component.html',
  styleUrls: ['./test-create.component.css']
})
export class TestCreateComponent implements OnInit {

  form!: FormGroup;

  /** Used to render the type-card grid in the template */
  testTypes = [
    {
      value: 'APTITUDE',
      label: 'Aptitude',
      icon: '🔢',
      desc: 'Quantitative & logical MCQs',
    },
    {
      value: 'TECHNICAL',
      label: 'Technical',
      icon: '💻',
      desc: 'CS fundamentals & domain MCQs',
    },
    {
      value: 'CODING',
      label: 'Coding',
      icon: '⚡',
      desc: 'Algorithmic challenges with IDE',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private mcqService: McqCreatorService,
    private codingService: CodingCreatorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title:           ['', Validators.required],
      description:     ['', Validators.required],
      testType:        ['', Validators.required],
      durationMinutes: [30, [Validators.required, Validators.min(5)]],
      totalQuestions:  [5,  [Validators.required, Validators.min(1)]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const type = this.form.value.testType;

    // ── Coding Test Flow ───────────────────────────
    if (type === 'CODING') {
      this.codingService.createTest({
        ...this.form.value,
        publicTest: false
      }).subscribe((res: any) => {
        const testId = res.testId || res.id;
        this.router.navigate(['/creator/coding/test', testId]);
      });
      return;
    }

    // ── MCQ Test Flow (Aptitude / Technical) ───────
    this.mcqService.createTest(this.form.value).subscribe((res: any) => {
      const testId = res.testId;
      this.router.navigate(['/creator/tests', testId]);
    });
  }

  f(name: string) {
    return this.form.get(name);
  }
}