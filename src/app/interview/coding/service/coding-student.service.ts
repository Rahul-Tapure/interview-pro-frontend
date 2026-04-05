import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class CodingStudentService {

  private baseUrl = `${environment.apiUrl}/interviewpro/coding/v1`;

  constructor(private http: HttpClient) {}

  getMyCodingResults() {
    return this.http.get<any[]>(`${this.baseUrl}/my-results`, { withCredentials: true });
  }

  startAttempt(testId: number): Observable<{ attemptId: string }> {
    return this.http.post<{ attemptId: string }>(
      `${this.baseUrl}/start-attempt/${testId}`,
      {},
      { withCredentials: true }
    );
  }
}
