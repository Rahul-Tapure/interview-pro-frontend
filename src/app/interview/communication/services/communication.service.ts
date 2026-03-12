import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CommunicationService {

  private BASE_URL = "/interviewpro/communication";

  constructor(private http: HttpClient) {}

  /* =====================================================
     ✅ TEST ENDPOINTS
  ===================================================== */

  createTest(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/tests`,
      data,
      { withCredentials: true }
    );
  }

  getAllActiveTests(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.BASE_URL}/tests`,
      { withCredentials: true }
    );
  }

  getTest(testId: number): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/tests/${testId}`,
      { withCredentials: true }
    );
  }

  getMyTests(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.BASE_URL}/tests/my`,
      { withCredentials: true }
    );
  }

  updateTest(testId: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.BASE_URL}/tests/${testId}`,
      data,
      { withCredentials: true }
    );
  }

  deleteTest(testId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.BASE_URL}/tests/${testId}`,
      { withCredentials: true }
    );
  }

  publishTest(testId: number): Observable<any> {
    return this.http.put<any>(
      `${this.BASE_URL}/tests/${testId}/publish`,
      {},
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ QUESTION ENDPOINTS (Creator step-by-step)
  ===================================================== */

  addQuestion(testId: number, data: any): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/tests/${testId}/questions`,
      data,
      { withCredentials: true }
    );
  }

  getQuestionByStep(testId: number, step: number): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/tests/${testId}/questions/${step}`,
      { withCredentials: true }
    );
  }

  updateQuestion(testId: number, step: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.BASE_URL}/tests/${testId}/questions/${step}`,
      data,
      { withCredentials: true }
    );
  }

  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.BASE_URL}/questions/${questionId}`,
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ SUBMISSION ENDPOINTS
  ===================================================== */

  startSubmission(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/submissions/start`,
      data,
      { withCredentials: true }
    );
  }

  completeSubmission(submissionId: number): Observable<any> {
    return this.http.put<any>(
      `${this.BASE_URL}/submissions/${submissionId}/complete`,
      {},
      { withCredentials: true }
    );
  }

  getSubmissionsByUser(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.BASE_URL}/submissions/my`,
      { withCredentials: true }
    );
  }

  getCompletedSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.BASE_URL}/submissions/my/completed`,
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ ANSWER ENDPOINTS
  ===================================================== */

  uploadAudio(blob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append("file", blob, "answer.webm");

    return this.http.post<any>(
      `${this.BASE_URL}/upload-audio`,
      formData,
      { withCredentials: true }
    );
  }

  submitAnswer(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/answers`,
      payload,
      { withCredentials: true }
    );
  }

  /* =====================================================
     ✅ FEEDBACK ENDPOINTS
  ===================================================== */

  getFeedbackByAnswer(answerId: number): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/feedback/answer/${answerId}`,
      { withCredentials: true }
    );
  }
}