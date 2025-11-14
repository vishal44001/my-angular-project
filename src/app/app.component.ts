import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { HeaderComponent } from './layout/header/header.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, SidenavComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private auth = inject(AuthService);

  // Use a getter so the template updates when AuthService state changes
  get isAuthenticated() {
    return this.auth.isAuthenticated();
  }
  title = 'angularProject';
}
