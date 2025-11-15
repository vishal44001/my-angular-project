import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {

  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {

    // If already logged in, redirect to dashboard
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Otherwise show login page
    return true;
  }
}
