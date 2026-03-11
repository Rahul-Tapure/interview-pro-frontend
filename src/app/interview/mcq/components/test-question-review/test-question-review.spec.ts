import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestQuestionReview } from './test-question-review';

describe('TestQuestionReview', () => {
  let component: TestQuestionReview;
  let fixture: ComponentFixture<TestQuestionReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestQuestionReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestQuestionReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
