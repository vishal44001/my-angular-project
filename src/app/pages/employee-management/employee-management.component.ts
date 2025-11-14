import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDialogComponent } from './employee-dialog.component';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  joiningDate: string; // ISO date
  status: 'Active' | 'Inactive' | 'On Leave';
}

const STORAGE_KEY = 'employees_v1';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit {
  employees: Employee[] = [];

  // UI state
  filteredEmployees: Employee[] = [];
  search = '';
  filterDept = '';
  filterRole = '';
  filterStatus = ''; // Add filterStatus property to track employee status filter

  // Form state
  formModel: Partial<Employee> = {};
  editingId: string | null = null;

  constructor(private dialog: MatDialog, private employeeService: EmployeeService,private toaster:ToastrService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    // prefer server data; fall back to localStorage seed when server unavailable
    this.employeeService.getAll().subscribe({
      next: (list) => {
        this.employees = Array.isArray(list) ? list.map(p => ({
          ...p,
          role: (p.role || '').toString().trim(),
          department: (p.department || '').toString().trim()
        })) : [];
        this.applyFilters();
      },
      error: () => {
        const raw = (typeof window !== 'undefined' && window.localStorage) ? localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Employee[];
            this.employees = parsed.map(p => ({
              ...p,
              role: (p.role || '').toString().trim(),
              department: (p.department || '').toString().trim()
            }));
          } catch {
            this.employees = [];
          }
        } else {
          // seed some sample data
          this.employees = [
            { id: this.guid(), name: 'Alice Johnson', role: 'Developer', department: 'Engineering', joiningDate: '2022-06-12', status: 'Active' },
            { id: this.guid(), name: 'Bob Smith', role: 'Designer', department: 'Product', joiningDate: '2021-02-01', status: 'Active' },
            { id: this.guid(), name: 'Clara Oswald', role: 'HR Manager', department: 'HR', joiningDate: '2019-09-15', status: 'On Leave' }
          ];
          this.save();
        }
        this.applyFilters();
      }
    });
  }

  private save(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.employees));
    }
  }

  startAdd(): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '400px',
      data: { title: 'Add Employee', name: '', role: '', department: '', joiningDate: new Date().toISOString().slice(0, 10), status: 'Active' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newEmp: Employee = {
          id: this.guid(),
          name: result.name,
          role: result.role,
          department: result.department,
          joiningDate: result.joiningDate,
          status: result.status
        };
        // persist via API, fall back to local save
        this.employeeService.create(newEmp).subscribe({
          next: (saved) => {
            this.employees.unshift(saved || newEmp);
            this.save();
            this.applyFilters();
            // show toaster success
            this.toaster.success(`${(saved || newEmp).name} added`, 'Employee added');
          },
          error: () => {
            this.employees.unshift(newEmp);
            this.save();
            this.applyFilters();
            this.toaster.error('Failed to add employee — saved locally', 'Add failed');
          }
        });
      }
    });
  }

  startEdit(emp: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '400px',
      data: { title: 'Edit Employee', ...emp }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const idx = this.employees.findIndex(e => e.id === emp.id);
        if (idx >= 0) {
          const updated = { ...emp, ...result } as Employee;
          // persist to server
          this.employeeService.update(emp.id, updated).subscribe({
            next: (saved) => {
              this.employees[idx] = saved || updated;
              this.save();
              this.applyFilters();
              // toaster success
              this.toaster.success(`${(saved || updated).name} updated`, 'Employee updated');
            },
            error: () => {
              // fallback: update locally
              this.employees[idx] = updated;
              this.save();
              this.applyFilters();
              this.toaster.error('Failed to update employee — changes saved locally', 'Update failed');
            }
          });
        }
      }
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.formModel = {};
  }

  deleteEmployee(id: string): void {
    // find employee name for dialog
    const emp = this.employees.find(e => e.id === id);
    const name = emp ? emp.name : '';

    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '440px',
      data: { name }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      // delete via API, fallback to local removal
      this.employeeService.delete(id).subscribe({
        next: () => {
          this.employees = this.employees.filter(e => e.id !== id);
          this.save();
          this.applyFilters();
          this.toaster.success(`${name || 'Employee'} deleted`, 'Employee deleted');
        },
        error: () => {
          // server failed - remove locally anyway
          this.employees = this.employees.filter(e => e.id !== id);
          this.save();
          this.applyFilters();
          this.toaster.error(`Failed to delete ${name || 'employee'} on server — removed locally`, 'Delete failed');
        }
      });
    });
  }

  applyFilters(): void {
    const q = this.search.trim().toLowerCase();
    this.filteredEmployees = this.employees.filter(e => {
      if (this.filterDept && e.department !== this.filterDept) return false;
      if (this.filterRole && e.role !== this.filterRole) return false;
      if (this.filterStatus && e.status !== this.filterStatus) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.search = '';
    this.filterDept = '';
    this.filterRole = '';
    this.filterStatus = ''; // Clear the status filter
    this.applyFilters();
  }

  uniqueDepartments(): string[] {
    return Array.from(new Set(this.employees.map(e => (e.department || '').toString().trim()).filter(Boolean))).sort();
  }

  uniqueRoles(): string[] {
    return Array.from(new Set(this.employees.map(e => (e.role || '').toString().trim()).filter(Boolean))).sort();
  }

  private guid(): string {
    // simple id
    return 'e_' + Math.random().toString(36).slice(2, 9);
  }
}
