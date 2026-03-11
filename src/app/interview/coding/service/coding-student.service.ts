import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class CodingStudentService {

  private baseUrl = 'http://localhost:8080/interviewpro/coding/v1';

  constructor(private http: HttpClient) {}

  getMyCodingResults() {
    return this.http.get<any[]>(`${this.baseUrl}/my-results`);
  }
}
