import { Component } from '@angular/core';
import { SidenavService } from '../sidenav/sidenav.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  appTitle = 'Recuiter Mangement Portal';
  constructor(private sidenav: SidenavService, private auth: AuthService) {}

  toggleSidenav() {
    this.sidenav.toggle();
  }

  get profile() {
    return this.auth.profile();
  }

  onProfileClick() {
    // simple behavior: logout when clicking avatar/icon
    this.auth.logout();
  }
}
