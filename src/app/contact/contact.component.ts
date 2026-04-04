// contact.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { ContactService } from './contact.service';

interface ContactApiResponse {
  success?: boolean;
  status?: string;
  message?: string;
  data?: unknown;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {

  contactForm!: FormGroup;
  loading   = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  submittedEmail = '';

  contactInfo = [
    {
      label: 'Email Us',
      value: 'support@interviewpro.dev',
      icon: '✉️',
      clr: '#818cf8',
      bg:  'rgba(99,102,241,.12)',
    },
    {
      label: 'Location',
      value: 'India — Remote Team',
      icon: '📍',
      clr: '#22d3ee',
      bg:  'rgba(34,211,238,.1)',
    },
    {
      label: 'Response Time',
      value: 'Within 24 hours',
      icon: '⏱️',
      clr: '#34d399',
      bg:  'rgba(52,211,153,.1)',
    },
    {
      label: 'Working Hours',
      value: 'Mon – Sat, 9 AM – 6 PM IST',
      icon: '🕐',
      clr: '#a78bfa',
      bg:  'rgba(167,139,250,.1)',
    },
  ];

  categories = [
    { label: 'General Inquiry',       value: 'general' },
    { label: 'Technical Support',     value: 'technical' },
    { label: 'Report a Bug',          value: 'bug' },
    { label: 'Feature Request',       value: 'feature' },
    { label: 'Creator / Educator',    value: 'creator' },
    { label: 'Partnership',           value: 'partnership' },
  ];

  socials = [
    {
      url: 'https://github.com/Rahul-Tapure',
      icon: 'GH',
      label: 'GitHub'
    },
    {
      url: 'https://x.com/RahulTapure',
      icon: 'X',
      label: 'X'
    },
    {
      url: 'https://www.linkedin.com/in/rahultanpure/',
      icon: 'in',
      label: 'LinkedIn'
    },
  ];

  constructor(
    private fb: NonNullableFormBuilder,
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name:     ['', [Validators.required]],
      subject:  ['', [Validators.required]],
      email:    ['', [Validators.required, Validators.email]],
      category: ['', [Validators.required]],
      message:  ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.contactForm.getRawValue();
    this.submittedEmail = payload.email;

    this.contactService.submitContactForm(payload).subscribe({
      next: (response) => {
        const typedResponse = response as ContactApiResponse;
        this.loading = false;

        if (typedResponse?.success === false || typedResponse?.status === 'error') {
          this.errorMessage = typedResponse?.message || 'Something went wrong. Please try again later.';
          this.cdr.detectChanges();
          return;
        }

        this.successMessage = typedResponse?.message || 'Your message has been sent successfully.';
        this.submitted = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again later.';
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.contactForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.submittedEmail = '';
    this.cdr.detectChanges();
  }

  get f() {
    return this.contactForm.controls;
  }
}