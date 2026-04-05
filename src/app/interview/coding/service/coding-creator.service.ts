import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CodingQuestion } from '../model/coding-question.model';
import { CodingTestCase } from '../model/coding-test-case.model';
import { CodingQuestionListItem } from '../model/coding-question-list.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CodingCreatorService {

  private BASE_URL = `${environment.apiUrl}/interviewpro/coding/v1/creator`;

  constructor(private http: HttpClient) {}

  /* ======================================================
                ✅ CODING TEST APIs
     ====================================================== */

  // ✅ Create Coding Test (Same UI as MCQ)
  createTest(payload: any) {
    return this.http.post(`${this.BASE_URL}/tests`, payload);
  }
  
updateTest(testId: number, payload: any) {
  return this.http.put(
    `${this.BASE_URL}/tests/${testId}`,
    payload
  );
}

  // ✅ Get My Coding Tests (Dashboard)
  getMyCodingTests() {
    return this.http.get<any[]>(`${this.BASE_URL}/tests`);
  }

  // ✅ View Full Test
  getTestById(testId: number) {
    return this.http.get<any>(
      `${this.BASE_URL}/tests/${testId}`
    );
  }

  getQuestionsByTest(testId: number) {
  return this.http.get<any[]>(
    `${this.BASE_URL}/tests/${testId}/questions`
  );
}


  // ✅ Delete Full Test
  deleteTest(testId: number) {
    return this.http.delete(
      `${this.BASE_URL}/tests/${testId}`
    );
  }

  /* ======================================================
              ✅ QUESTIONS UNDER TEST APIs
     ====================================================== */

  // ✅ Add Question inside a Test
  createQuestion(testId: number, step: number, body: any) {
  return this.http.post(
    `${this.BASE_URL}/tests/${testId}/questions?step=${step}`,
    body,
    { withCredentials: true }
  );
}

getQuestionByStep(testId: number, step: number) {
  return this.http.get(
    `${this.BASE_URL}/tests/${testId}/question?step=${step}`
  );
}

updateQuestion(questionId: number, body: any) {
  return this.http.put(
    `${this.BASE_URL}/questions/${questionId}`,
    body
  );
}


  // ✅ Get Questions of a Test
  getQuestionsOfTest(testId: number) {
    return this.http.get<CodingQuestionListItem[]>(
      `${this.BASE_URL}/tests/${testId}/questions`
    );
  }

  // ✅ Get Single Question
  getQuestion(id: number) {
    return this.http.get<CodingQuestion>(
      `${this.BASE_URL}/questions/${id}`
    );
  }

  // ✅ Delete Question
  deleteQuestion(id: number) {
    return this.http.delete(
      `${this.BASE_URL}/questions/${id}`
    );
  }

  /* ======================================================
                ✅ TEST CASE APIs
     ====================================================== */

  addTestCase(questionId: number, payload: any) {
    return this.http.post(
      `${this.BASE_URL}/questions/${questionId}/test-cases`,
      payload
    );
  }
updateTestCase(id: number, payload: any) {
  return this.http.put(
    `${this.BASE_URL}/test-cases/${id}`,
    payload
  );
}

  getTestCases(questionId: number) {
    return this.http.get<CodingTestCase[]>(
      `${this.BASE_URL}/questions/${questionId}/test-cases`
    );
  }

  deleteTestCase(testCaseId: number) {
    return this.http.delete(
      `${this.BASE_URL}/test-cases/${testCaseId}`
    );
  }

  /* ======================================================
                ✅ PUBLISH QUESTION API
     ====================================================== */
publishTest(testId: number) {
  return this.http.post(
    `${this.BASE_URL}/tests/${testId}/publish`,
    {}
  );
}

}
