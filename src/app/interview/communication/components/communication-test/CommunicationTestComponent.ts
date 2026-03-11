// communication-start-test.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-communication-start-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communication-test.component.html',
  styleUrls: ['./communication-test.component.css']
})
export class CommunicationStartTestComponent implements OnInit, OnDestroy {

  submissionId!: number;
  testId!: number;

  questions: any[] = [];
  currentIndex = 0;

  mediaRecorder!: MediaRecorder;
  audioChunks: Blob[] = [];
  audioBlob!: Blob;

  recording = false;
  recorded = false;
  submitting = false;

  timer = 120;
  interval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    this.startSubmission();
  }

  ngOnDestroy(): void {
    // Clean up timer and media stream
    clearInterval(this.interval);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /** Start test submission */
  startSubmission(): void {
    this.http.post('http://localhost:8080/interviewpro/communication/start', {
      testId: this.testId
      // userId will be read from security context in backend
    }).subscribe({
      next: (res: any) => {
        this.submissionId = res.id || res.submissionId;
        this.loadTest();
      },
      error: (err: any) => {
        console.error('Submission start failed:', err);
        alert('Failed to start test. Please try again.');
        this.router.navigate(['/communication/tests']);
      }
    });
  }

  /** Load test questions */
  loadTest(): void {
    this.http.get(`http://localhost:8080/interviewpro/communication/test/${this.testId}`)
      .subscribe({
        next: (res: any) => {
          this.questions = res.questions || [];
          // Set timer from first question's time limit
          if (this.questions.length > 0) {
            this.timer = this.questions[0].timeLimit || 120;
          }
        },
        error: (err: any) => {
          console.error('Test load failed:', err);
          alert('Failed to load test questions.');
        }
      });
  }

  /** Start audio recording */
  async startRecording(): Promise<void> {
    if (this.recorded) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.recorded = true;

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.recording = true;
      this.startTimer();

    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required. Please allow microphone permissions.');
    }
  }

  /** Stop audio recording */
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    this.recording = false;
    clearInterval(this.interval);
  }

  /** Start countdown timer */
  startTimer(): void {
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.timer--;

      if (this.timer <= 0) {
        this.stopRecording();
      }
    }, 1000);
  }

  /** Submit answer */
  submitAnswer(): void {
    if (!this.recorded || !this.submissionId) return;

    const question = this.questions[this.currentIndex];
    this.submitting = true;

    // Upload audio first
    this.uploadAudio(this.audioBlob).subscribe({
      next: (uploadRes: any) => {
        // Then submit answer with audio URL
        const payload = {
          submissionId: this.submissionId,
          questionId: question.id,
          audioUrl: uploadRes.audioUrl,
          assemblyaiJobId: uploadRes.jobId || null
        };

        this.http.post('http://localhost:8080/interviewpro/communication/submit-answer', payload)
          .subscribe({
            next: () => {
              this.submitting = false;
              this.nextQuestion();
            },
            error: (err: any) => {
              this.submitting = false;
              console.error('Answer submission failed:', err);
              alert('Failed to submit answer. Please try again.');
            }
          });
      },
      error: (err: any) => {
        this.submitting = false;
        console.error('Audio upload failed:', err);
        alert('Failed to upload audio. Please try again.');
      }
    });
  }

  /** Upload audio blob to server */
  uploadAudio(blob: Blob): any {
    const formData = new FormData();
    formData.append('audio', blob, 'answer.webm');

    return this.http.post('http://localhost:8080/interviewpro/communication/upload-audio', formData);
  }

  /** Move to next question or finish test */
  nextQuestion(): void {
    this.currentIndex++;

    if (this.currentIndex >= this.questions.length) {
      // Test completed
      alert('✅ Communication round completed!');
      this.router.navigate(['/communication/result', this.submissionId]);
      return;
    }

    // Reset for next question
    this.recorded = false;
    this.recording = false;
    this.timer = this.questions[this.currentIndex].timeLimit || 120;
    this.audioChunks = [];
    clearInterval(this.interval);
  }
}