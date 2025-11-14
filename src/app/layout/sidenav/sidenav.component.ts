import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidenavService } from './sidenav.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidenav',
  // standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatListModule, MatIconModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/employee-management', icon: 'people', label: 'Employee Management' },
    { path: '/job-applicants', icon: 'person_search', label: 'Job Applicants' }
  ];

  /** 'side' for desktop, 'over' for small screens */
  sidenavMode: 'side' | 'over' = 'side';
  isExpanded = true;
  private toggleSub?: Subscription;
  constructor(private sidenavService: SidenavService) {}

  ngOnInit(): void {
    // guard for SSR
    const width = (typeof window !== 'undefined') ? window.innerWidth : 1200;
    this.updateForWidth(width);
    // subscribe to toggle events from header/service
    // subscribe to toggle events from header/service
    this.toggleSub = this.sidenavService.toggle$.subscribe(() => this.toggleSidenav());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const width = event && event.target ? event.target.innerWidth : (typeof window !== 'undefined' ? window.innerWidth : 1200);
    this.updateForWidth(width);
  }

  private updateForWidth(width: number) {
    const mobile = width < 900; // breakpoint — adjust as needed
    this.sidenavMode = mobile ? 'over' : 'side';
    this.isExpanded = !mobile;
  }

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }

  ngOnDestroy(): void {
    this.toggleSub?.unsubscribe();
  }
}
