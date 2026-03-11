import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CommunicationService {

  private BASE_URL = "http://localhost:8080/interviewpro/communication";

  constructor(private http: HttpClient) {}

  startSubmission(data:any) {

    return this.http.post<any>(
      `${this.BASE_URL}/submissions/start`,
      data,
      { withCredentials:true }
    );

  }
uploadAudio(blob: Blob) {

  const formData = new FormData();
  formData.append("file", blob);

  return this.http.post<any>(
    "http://localhost:8080/interviewpro/communication/upload-audio",
    formData,
    { withCredentials:true }
  );
}
  getTest(testId:number) {

    return this.http.get<any>(
      `${this.BASE_URL}/tests/${testId}`,
      { withCredentials:true }
    );

  }

  submitAnswer(payload:any) {

    return this.http.post(
      `${this.BASE_URL}/answers`,
      payload,
      { withCredentials:true }
    );

  }

}