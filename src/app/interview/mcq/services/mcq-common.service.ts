import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Test } from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class McqCommonService {

  private BASE_URL = `${environment.apiUrl}/interviewpro/home`;

  constructor(private http: HttpClient) {}

  /* =====================================================
     ✅ COMMON / PUBLIC TEST APIs
     (Accessible by STUDENT + CREATOR)
  ===================================================== */

  /**
   * Get all public tests
   */
  getAllPublicTests(): Observable<Test[]> {
    return this.http.get<Test[]>(
      `${this.BASE_URL}/tests`,
      { withCredentials: true }
    );
  }

  /**
   * Get all public tests by type (APTITUDE / TECHNICAL)
   */
  getAllPublicTestsByType(
    type: 'APTITUDE' | 'TECHNICAL' | 'CODING'
  ): Observable<Test[]> {
    return this.http.get<Test[]>(
      `${this.BASE_URL}/tests/by-type?type=${type}`,
      { withCredentials: true }
    );
  }
}
