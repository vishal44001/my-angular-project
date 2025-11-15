import { Routes } from '@angular/router';
import { RedirectGuard } from './guards/loginguard.guard';

import { AuthGuard } from './guards/auth-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
     canActivate: [RedirectGuard]
  },
  {
    path: 'employee-management',
    loadComponent: () => import('./pages/employee-management/employee-management.component').then(m => m.EmployeeManagementComponent),
     canActivate: [AuthGuard]
  },
  {
    path: 'job-applicants',
    loadComponent: () => import('./pages/job-applicants/job-applicants.component').then(m => m.JobApplicantsComponent),
     canActivate: [AuthGuard]
  }
];
