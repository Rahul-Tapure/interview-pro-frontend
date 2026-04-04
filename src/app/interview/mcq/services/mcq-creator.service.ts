import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { QuestionCount } from '../models/question-count.model';
import { PreviousQuestion } from '../models/previous-question.model';

@Injectable({ providedIn: 'root' })
export class McqCreatorService {

  private BASE_URL = environment.production
    ? `${environment.apiUrl}/interviewpro/mcq/v1`
    : '/interviewpro/mcq/v1';

  constructor(private http: HttpClient) {}

  /* =====================================================
     ✅ TEST CREATION & MANAGEMENT
  ===================================================== */

  createTest(payload: any): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/creator/tests`,
      payload,
      { withCredentials: true }
    );
  }

  getMyTests(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.BASE_URL}/creator/tests`,
      { withCredentials: true }
    );
  }

  deleteTest(testId: number): Observable<any> {
    return this.http.delete(
      `${this.BASE_URL}/creator/tests/${testId}`,
      { withCredentials: true }
    );
  }

  publishTest(testId: number): Observable<any> {
    return this.http.put(
      `${this.BASE_URL}/creator/tests/${testId}/publish`,
      {},
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ QUESTIONS & OPTIONS
  ===================================================== */

  addQuestion(testId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/creator/tests/${testId}/questions`,
      payload,
      { withCredentials: true }
    );
  }

  addOptions(questionId: number, payload: any[]): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/creator/questions/${questionId}/options`,
      payload,
      { withCredentials: true }
    );
  }

  updateQuestion(questionId: number, payload: any): Observable<any> {
    return this.http.put(
      `${this.BASE_URL}/creator/questions/${questionId}`,
      payload,
      { withCredentials: true }
    );
  }

  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(
      `${this.BASE_URL}/creator/questions/${questionId}`,
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ TEST EDIT / VIEW
  ===================================================== */

  getTestDetails(testId: number): Observable<any> {
    return this.http.get(
      `${this.BASE_URL}/creator/tests/${testId}`,
      { withCredentials: true }
    );
  }

  getTestForEdit(testId: number): Observable<any> {
    return this.http.get(
      `${this.BASE_URL}/creator/tests/${testId}/edit`,
      { withCredentials: true }
    );
  }

  updatePrivateTest(testId: number, payload: any): Observable<any> {
    return this.http.put(
      `${this.BASE_URL}/creator/tests/${testId}/edit`,
      payload,
      { withCredentials: true }
    );
  }

  viewFullTest(testId: number): Observable<any> {
    return this.http.get(
      `${this.BASE_URL}/creator/view/tests/${testId}`,
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ HELPERS
  ===================================================== */

  getQuestionCount(testId: number): Observable<QuestionCount> {
    return this.http.get<QuestionCount>(
      `${this.BASE_URL}/creator/tests/${testId}/questions/count`,
      { withCredentials: true }
    );
  }

  getTestQuestionIds(testId: number): Observable<number[]> {
    return this.http.get<number[]>(
      `${this.BASE_URL}/creator/tests/${testId}/question-ids`,
      { withCredentials: true }
    );
  }

  getPreviousQuestion(questionId: number): Observable<PreviousQuestion> {
    return this.http.get<PreviousQuestion>(
      `${this.BASE_URL}/creator/questions/${questionId}`,
      { withCredentials: true }
    );
  }

    /* 🔥 NEW: Filter by test type */
 getMyTestsByType(type: 'APTITUDE' | 'TECHNICAL') {
  return this.http.get<any[]>(
    `${this.BASE_URL}/creator/dashboard/tests`,
    {
      params: { type },          // 🔥 THIS WAS MISSING
      withCredentials: true
    }
  );
}

}
