import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';
import { ApplicantsService } from '../../services/applicants.service';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  joiningDate: string; // ISO date
  status: 'Active' | 'Inactive' | 'On Leave';
}

const EMP_KEY = 'employees_v1';
const APPLICANTS_KEY = 'applicants_v1';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MatCardModule, MatSelectModule, MatInputModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // raw data
  employees: Employee[] = [];
  applicants: any[] = [];

  // stats
  totalEmployees = 0;
  totalApplicants = 0;
  departmentCount = 0;
  activeJobRoles = 0;

  // filters for the table/chart
  filterDept = '';
  filterRole = '';
  search = '';

  // derived for chart (department -> count)
  deptCounts: { dept: string; count: number }[] = [];

  // table view
  displayedColumns = ['name', 'role', 'department', 'status', 'joiningDate'];
  tableData: Employee[] = [];

  constructor(private employeeService: EmployeeService, private applicantsService: ApplicantsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // prefer API data, fallback to localStorage
    this.employeeService.getAll().subscribe({
    
      next: (list) => {
        debugger
        this.employees = Array.isArray(list) ? list.map(p => ({
          ...p,
          role: (p.role || '').toString().trim(),
          department: (p.department || '').toString().trim()
        })) : [];
        // load applicants from API (with localStorage fallback)
        this.loadApplicantsFromApi();
        this.computeStats();
        this.applyFilters();
      },
      error: () => {
        // fallback: load from localStorage (guarded for SSR)
        try {
          const raw = (typeof window !== 'undefined' && window.localStorage) ? localStorage.getItem(EMP_KEY) : null;
          this.employees = raw ? JSON.parse(raw) as Employee[] : [];
        } catch {
          this.employees = [];
        }
        // still attempt to load applicants from API, otherwise fallback below
        this.loadApplicantsFromApi();
        this.computeStats();
        this.applyFilters();
      }
    });
  }

  // separate method to load applicants from API with localStorage fallback
  private loadApplicantsFromApi(): void {
    this.applicantsService.getAll().subscribe({
  
      next: (list) => {
        debugger
        this.applicants = Array.isArray(list) ? list : [];
        this.computeStats();
      },
      error: () => {
        try {
          const raw2 = (typeof window !== 'undefined' && window.localStorage) ? localStorage.getItem(APPLICANTS_KEY) : null;
          this.applicants = raw2 ? JSON.parse(raw2) : [];
        } catch {
          this.applicants = [];
        }
        this.computeStats();
      }
    });
  }

  computeStats(): void {
    this.totalEmployees = this.employees.length;
    this.totalApplicants = this.applicants.length;

    const depts = new Set(this.employees.map(e => e.department));
    this.departmentCount = depts.size;

    const activeRoles = new Set(
      this.employees.filter(e => e.status === 'Active').map(e => e.role)
    );
    this.activeJobRoles = activeRoles.size;

    // department counts for chart
    const map = new Map<string, number>();
    this.employees.forEach(e => map.set(e.department, (map.get(e.department) || 0) + 1));
    this.deptCounts = Array.from(map.entries()).map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count);
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();
    this.tableData = this.employees.filter(e => {
      if (this.filterDept && e.department !== this.filterDept) return false;
      if (this.filterRole && e.role !== this.filterRole) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filterDept = '';
    this.filterRole = '';
    this.search = '';
    this.applyFilters();
  }

  uniqueDepartments(): string[] {
    return Array.from(new Set(this.employees.map(e => (e.department || '').toString().trim()).filter(Boolean))).sort();
  }

  uniqueRoles(): string[] {
    return Array.from(new Set(this.employees.map(e => (e.role || '').toString().trim()).filter(Boolean))).sort();
  }

  // helper: compute initials for avatar display
  getInitials(name?: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // return a CSS gradient for a department badge
  deptGradient(dept?: string): string {
    switch ((dept || '').toLowerCase()) {
      case 'dta':
        return 'linear-gradient(180deg,#06b6a4,#10b981)';
      case 'product':
        return 'linear-gradient(180deg,#22c1f3,#2b9cf8)';
      case 'hr':
        return 'linear-gradient(180deg,#8b5cf6,#a78bfa)';
      default:
        return 'linear-gradient(180deg,#cbd5e1,#e2e8f0)';
    }
  }
}
