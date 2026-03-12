// communication-edit-test.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunicationService } from '../../services/communication.service';

@Component({
  selector: 'app-communication-edit-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communication-edit-test.html',
  styleUrls: ['./communication-edit-test.css']
})
export class CommunicationEditTestComponent implements OnInit {

  testId!: number;
  test: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communicationService: CommunicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
    this.loadTest();
  }

  loadTest(): void {
    this.loading = true;
    this.communicationService.getTest(this.testId).subscribe({
      next: (res: any) => {
        console.log('Test loaded:', res);
        this.test = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load test.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/creator']);
  }
}
