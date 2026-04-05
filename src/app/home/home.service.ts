import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HomeStats {
  rounds: number;
  questions: number;
  tests: number;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = `${environment.apiUrl}/interviewpro/home`;

  constructor(private http: HttpClient) {}

  loadStats(): Observable<HomeStats> {
    return this.http
      .get<any>(`${this.baseUrl}/stats`, {
        withCredentials: true
      })
      .pipe(
        map((response) => this.mapStatsResponse(response)),
        catchError(() => this.loadStatsFallback())
      );
  }

  private loadStatsFallback(): Observable<HomeStats> {
    return forkJoin({
      aptitudeTests: this.http
        .get<any[]>(`${this.baseUrl}/tests/by-type?type=APTITUDE`, {
          withCredentials: true
        })
        .pipe(catchError(() => of([]))),
      technicalTests: this.http
        .get<any[]>(`${this.baseUrl}/tests/by-type?type=TECHNICAL`, {
          withCredentials: true
        })
        .pipe(catchError(() => of([]))),
      codingTests: this.http
        .get<any[]>(`${this.baseUrl}/tests/by-type?type=CODING`, {
          withCredentials: true
        })
        .pipe(catchError(() => of([]))),
      communicationTests: this.http
        .get<any[]>(`${environment.production ? `${environment.apiUrl}/interviewpro/communication` : '/interviewpro/communication'}/tests`, {
          withCredentials: true
        })
        .pipe(catchError(() => of([])))
    }).pipe(
      map(({ aptitudeTests, technicalTests, codingTests, communicationTests }) => {
        const tests =
          aptitudeTests.length +
          technicalTests.length +
          codingTests.length +
          communicationTests.length;

        const rounds =
          [
            aptitudeTests.length,
            technicalTests.length,
            codingTests.length,
            communicationTests.length
          ].filter((count) => count > 0).length || 4;

        const questions =
          this.sumQuestions(aptitudeTests) +
          this.sumQuestions(technicalTests) +
          this.sumQuestions(codingTests) +
          this.sumQuestions(communicationTests);

        return {
          rounds,
          questions,
          tests
        };
      })
    );
  }

  private mapStatsResponse(response: any): HomeStats {
    const data = response?.data ?? response ?? {};

    return {
      rounds: Number(data.rounds ?? data.interviewRounds ?? 4),
      questions: Number(data.questions ?? data.practiceQuestions ?? data.totalQuestions ?? 0),
      tests: Number(data.tests ?? data.liveTests ?? data.totalTests ?? 0)
    };
  }

  private sumQuestions(tests: any[]): number {
    return tests.reduce((total, test) => {
      const value = Number(
        test?.totalQuestions ??
          test?.questionCount ??
          test?.questionsCount ??
          0
      );

      return total + (Number.isFinite(value) ? value : 0);
    }, 0);
  }
}
