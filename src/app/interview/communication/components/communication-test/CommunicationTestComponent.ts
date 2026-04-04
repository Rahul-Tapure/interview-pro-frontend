import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommunicationService } from '../../services/communication.service';
import { CommunicationResultComponent } from '../communication-result/communication-result.component';

@Component({
  selector: 'app-communication-test',
  standalone: true,
  imports: [CommonModule, CommunicationResultComponent],
  templateUrl: './communication-test.component.html',
  styleUrls: ['./communication-test.component.css']
})
export class CommunicationTestComponent implements OnInit, OnDestroy {

  submissionId!: number;
  testId!: number;
  testTitle = '';

  questions: any[] = [];
  currentIndex = 0;

  mediaRecorder!: MediaRecorder;
  audioChunks: Blob[] = [];
  audioBlob!: Blob;

  recording = false;
  recorded = false;
  submitting = false;
  completed = false;
  feedbackLoading = false;
  feedbackError = '';
  completedSubmission: any | null = null;

  timer = 120;
  interval: any;
  feedbackRetryTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communicationService: CommunicationService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  goToDashboard() {
    this.router.navigate(['/dashboard/user']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));

    this.communicationService.startSubmission({
      testId: this.testId
    })
    .subscribe({
      next: (res: any) => {
        console.log('Submission response:', res);
        this.submissionId = res.id || res.submissionId;
        this.loadTest();
        this.cdr.detectChanges();
      },
      error: err => console.error("Submission start failed", err)
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    clearTimeout(this.feedbackRetryTimeout);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  loadTest() {
    this.communicationService.getTest(this.testId)
      .subscribe({
        next: res => {
          console.log('Test loaded:', res);
          this.testTitle = res.title || 'Communication Test';
          this.questions = res.questions || [];
          if (this.questions.length > 0) {
            this.timer = this.questions[0].timeLimit || 120;
          }
          this.cdr.detectChanges();
        },
        error: err => console.error("Test load failed", err)
      });
  }

  get formattedTime(): string {
    const m = Math.floor(this.timer / 60);
    const s = this.timer % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  }

  async startRecording() {
    if (this.recorded) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      this.audioChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      this.ngZone.run(() => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.recorded = true;
        console.log('Recording stopped, blob size:', this.audioBlob.size);
        this.cdr.detectChanges();
      });
      stream.getTracks().forEach(track => track.stop());
    };

    this.mediaRecorder.start();
    this.recording = true;
    this.startTimer();
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.ngZone.run(() => {
      this.recording = false;
      clearInterval(this.interval);
      this.cdr.detectChanges();
    });
  }

  startTimer() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.ngZone.run(() => {
        this.timer--;
        if (this.timer <= 0) {
          this.stopRecording();
        }
        this.cdr.detectChanges();
      });
    }, 1000);
  }

  submitAnswer() {
    const question = this.questions[this.currentIndex];
    this.submitting = true;

    this.communicationService
      .uploadAudio(this.audioBlob)
      .subscribe({
        next: (res) => {
          console.log('Upload response:', res);
          const payload = {
            submissionId: this.submissionId,
            questionId: question.id,
            audioUrl: res.audioUrl,
            assemblyaiJobId: res.jobId
          };

          this.communicationService
            .submitAnswer(payload)
            .subscribe({
              next: (answerRes) => {
                console.log('Answer submitted:', answerRes);
                this.submitting = false;
                this.nextQuestion();
                this.cdr.detectChanges();
              },
              error: (err) => {
                this.submitting = false;
                console.error('Answer submission failed', err);
              }
            });
        },
        error: (err) => {
          this.submitting = false;
          console.error('Audio upload failed', err);
        }
      });
  }

  nextQuestion() {
    this.currentIndex++;

    if (this.currentIndex >= this.questions.length) {
      this.finishTestAndLoadFeedback();
      return;
    }

    this.recorded = false;
    this.recording = false;
    this.timer = this.questions[this.currentIndex].timeLimit || 120;
    this.audioChunks = [];
    clearInterval(this.interval);
  }

  private finishTestAndLoadFeedback(): void {
    this.completed = true;
    this.feedbackLoading = true;
    this.feedbackError = '';
    this.completedSubmission = null;

    this.communicationService.completeSubmission(this.submissionId).subscribe({
      next: () => {
        this.fetchCompletedSubmissionWithRetry();
      },
      error: (err) => {
        console.error('Complete submission failed', err);
        this.fetchCompletedSubmissionWithRetry();
      }
    });
  }

  private fetchCompletedSubmissionWithRetry(attempt = 0): void {
    const maxAttempts = 8;

    this.communicationService.getCompletedSubmissions().subscribe({
      next: (submissions) => {
        const matched = submissions.find((sub: any) => Number(sub.id) === Number(this.submissionId));

        if (matched) {
          this.completedSubmission = matched;
          this.feedbackLoading = false;
          this.feedbackError = '';
          this.cdr.detectChanges();
          return;
        }

        if (attempt < maxAttempts) {
          this.feedbackRetryTimeout = setTimeout(() => {
            this.fetchCompletedSubmissionWithRetry(attempt + 1);
          }, 2000);
          return;
        }

        this.feedbackLoading = false;
        this.feedbackError = 'Feedback is still processing. Please check your dashboard in a moment.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load completed communication submissions', err);

        if (attempt < maxAttempts) {
          this.feedbackRetryTimeout = setTimeout(() => {
            this.fetchCompletedSubmissionWithRetry(attempt + 1);
          }, 2000);
          return;
        }

        this.feedbackLoading = false;
        this.feedbackError = 'Unable to load feedback right now. Please check your dashboard.';
        this.cdr.detectChanges();
      }
    });
  }
}