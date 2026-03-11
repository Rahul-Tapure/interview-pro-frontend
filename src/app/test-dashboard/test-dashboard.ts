
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './test-dashboard.html',
  styleUrls: ['./test-dashboard.css'],
})
export class TestComponent {


  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
    
}