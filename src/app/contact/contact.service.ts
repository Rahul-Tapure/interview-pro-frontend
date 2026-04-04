import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

interface ContactResponse {
  status: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {

  private readonly apiUrl = environment.production
    ? `${environment.apiUrl}/interviewpro/api/contact`
    : '/interviewpro/api/contact';

  constructor(private http: HttpClient) {}

  submitContactForm(payload: ContactPayload): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, payload);
  }
}
