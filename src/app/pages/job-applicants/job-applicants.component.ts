
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { ApplicantsService } from '../../services/applicants.service';

interface Applicant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roleCategory: string; 
  appliedRole: string;
  status: 'New' | 'Shortlisted' | 'Rejected' | 'Hired';
  appliedDate: string; // ISO
  notes?: string;
}

const STORAGE_KEY = 'applicants_v1';

@Component({
  selector: 'app-job-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MatCardModule, MatSelectModule, MatIconModule, MatButtonModule, MatInputModule, MatMenuModule],
  templateUrl: './job-applicants.component.html',
  styleUrls: ['./job-applicants.component.scss']
})
export class JobApplicantsComponent implements OnInit {
  applicants: Applicant[] = [];

  // UI state
  filtered: Applicant[] = [];
  search = '';
  filterRoleCategory = '';
  filterStatus = '';
  sortBy: 'newest' | 'oldest' | 'name' = 'newest';

  constructor(private applicantsService: ApplicantsService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    // prefer server data via ApplicantsService; fall back to localStorage seed if server not reachable
    this.applicantsService.getAll().subscribe({
      next: (list) => {
        this.applicants = Array.isArray(list) ? list : [];
        this.applyFilters();
      },
      error: () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            this.applicants = JSON.parse(raw) as Applicant[];
          } catch {
            this.applicants = [];
          }
        } else {
          // seed sample applicants
          this.applicants = [
            { id: this.id(), name: 'Sam Taylor', email: 'sam@example.com', phone: '555-1212', roleCategory: 'Frontend Dev', appliedRole: 'Angular Developer', status: 'New', appliedDate: '2024-10-01' },
            { id: this.id(), name: 'Rita Gomez', email: 'rita@example.com', phone: '555-1313', roleCategory: 'Backend Dev', appliedRole: 'Node.js Developer', status: 'Shortlisted', appliedDate: '2024-09-20' },
            { id: this.id(), name: 'Lee Wong', email: 'lee@example.com', phone: '555-1414', roleCategory: 'Tester', appliedRole: 'QA Engineer', status: 'Rejected', appliedDate: '2024-09-25' }
          ];
          this.save();
        }
        this.applyFilters();
      }
    });
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.applicants));
  }

  uniqueRoleCategories(): string[] {
    return Array.from(new Set(this.applicants.map(a => a.roleCategory))).sort();
  }

  uniqueStatuses(): string[] {
    return ['New', 'Shortlisted', 'Rejected', 'Hired'];
  }

  // helper for avatar initials
  getInitials(name?: string): string {
    if (!name) return '';
    return name.split(' ').filter(Boolean).map(n => n[0]).slice(0,2).join('').toUpperCase();
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();
    this.filtered = this.applicants.filter(a => {
      if (this.filterRoleCategory && a.roleCategory !== this.filterRoleCategory) return false;
      if (this.filterStatus && a.status !== this.filterStatus) return false;
      if (q && !(a.name.toLowerCase().includes(q) || a.appliedRole.toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q))) return false;
      return true;
    });

    this.sortFiltered();
  }

  clearFilters(): void {
    this.search = '';
    this.filterRoleCategory = '';
    this.filterStatus = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  private sortFiltered(): void {
    if (this.sortBy === 'name') {
      this.filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'oldest') {
      this.filtered.sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime());
    } else {
      // newest
      this.filtered.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    }
  }

  updateStatus(app: Applicant, status: Applicant['status']): void {
    const old = app.status;
    app.status = status;
    // persist to server, fall back to local save
    this.applicantsService.update(app.id, app).subscribe({
      next: () => {
        this.save();
        this.applyFilters();
      },
      error: () => {
        // revert if server failed
        app.status = old;
        this.save();
        this.applyFilters();
      }
    });
  }

  private id(): string {
    return 'a_' + Math.random().toString(36).slice(2, 9);
  }
}
