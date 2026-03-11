// about.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  stats = [
    { num: '4+',    label: 'Interview Rounds' },
    { num: '200+',  label: 'Practice Questions' },
    { num: '50+',   label: 'Coding Challenges' },
    { num: '98%',   label: 'Student Satisfaction' },
    { num: '1000+', label: 'Students Registered' },
  ];

  mission = [
    'Free access to structured interview practice',
    'Real-world test formats used by top companies',
    'Instant feedback and result tracking',
    'Separate dashboards for students and creators',
    'Regularly updated question banks',
  ];

  rounds = [
    {
      icon: '🎤',
      name: 'Communication Round',
      desc: 'HR interview practice, soft skills coaching and verbal communication exercises.',
      tag: 'Coming Soon',
      clr: '#a78bfa',
      bg: 'rgba(167,139,250,.1)',
    },
    {
      icon: '🔢',
      name: 'Aptitude Round',
      desc: 'Quantitative reasoning, logical thinking, and data interpretation timed tests.',
      tag: 'Available Now',
      clr: '#22d3ee',
      bg: 'rgba(34,211,238,.1)',
    },
    {
      icon: '💻',
      name: 'Technical Round',
      desc: 'Domain-specific MCQs covering OS, DBMS, networking, OOP, and more.',
      tag: 'Available Now',
      clr: '#818cf8',
      bg: 'rgba(99,102,241,.12)',
    },
    {
      icon: '⚡',
      name: 'Coding Round',
      desc: 'Solve algorithmic challenges in a live in-browser IDE with multi-language support.',
      tag: 'Available Now',
      clr: '#34d399',
      bg: 'rgba(52,211,153,.1)',
    },
  ];

  values = [
    {
      icon: '🎯',
      title: 'Focused Learning',
      desc: 'Every round is purpose-built to match actual interview formats used by top companies.',
    },
    {
      icon: '⚡',
      title: 'Instant Feedback',
      desc: 'Get your scores and detailed results immediately after completing any test.',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      desc: 'Role-based access ensures students and creators see only what they need.',
    },
    {
      icon: '📈',
      title: 'Track Progress',
      desc: 'Monitor your performance over time and identify areas that need improvement.',
    },
    {
      icon: '🌐',
      title: 'Always Available',
      desc: 'Practice anytime, anywhere — no scheduling or downloads required.',
    },
    {
      icon: '🤝',
      title: 'Community Driven',
      desc: 'Tests are created by experienced educators and industry professionals.',
    },
  ];
}