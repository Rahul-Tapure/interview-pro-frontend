import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Test } from '../models/test.model';
import { Result } from '../models/result.model';

@Injectable({ providedIn: 'root' })
export class McqStudentService {

  private BASE_URL = 'http://localhost:8080/interviewpro/mcq/v1';

  constructor(private http: HttpClient) {}

  /* =====================================================
     ✅ PUBLIC TEST LIST (STUDENT)
  ===================================================== */

  getAllPublicTests(): Observable<Test[]> {
    return this.http.get<Test[]>(
      `${this.BASE_URL}/common/tests`,
      { withCredentials: true }
    );
  }

  getAllPublicTestsByType(
    type: 'APTITUDE' | 'TECHNICAL'
  ): Observable<Test[]> {
    return this.http.get<Test[]>(
      `${this.BASE_URL}/common/tests/by-type?type=${type}`,
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ TEST ATTEMPT FLOW
  ===================================================== */

  startTest(testId: number): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/student/tests/${testId}/start`,
      {},
      { withCredentials: true }
    );
  }

  submitTest(
    attemptId: number,
    answers: Record<number, number>
  ): Observable<Result> {
    return this.http.post<Result>(
      `${this.BASE_URL}/student/attempts/${attemptId}/submit`,
      { answers },
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ STUDENT RESULTS
  ===================================================== */

  getMyResults(): Observable<Result[]> {
    return this.http.get<Result[]>(
      `${this.BASE_URL}/student/my-attempts`,
      { withCredentials: true }
    );
  }
}
