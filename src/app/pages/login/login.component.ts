
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';
// import {googl}
// Access `window.google` at runtime to avoid ReferenceError in SSR.

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']

})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    // Only run in browser
    if (typeof window === 'undefined') return;

    try {
      await this.loadGsiClient();
      const g = (window as any).google;
      if (!g || !g.accounts || !g.accounts.id) {
        console.error('Google Identity Services (gsi) not available after load.');
        return;
      }

      g.accounts.id.initialize({
        client_id: '621152386206-ipgjnritkuf1bck4d1ipjp0vp32jh4tv.apps.googleusercontent.com', // Replace with your actual Client ID
        callback: this.handleCredentialResponse.bind(this)
        // '621152386206-ipgjnritkuf1bck4d1ipjp0vp32jh4tv.apps.googleusercontent.com'
      });

      g.accounts.id.renderButton(
        document.getElementById('google-button'), // The HTML element where the button will be rendered
        { theme: 'outline', size: 'large' } // Customization options for the button
      );
    } catch (err) {
      console.error('Failed to load Google Identity Services client', err);
    }
  }

  /** Ensure GSI client script is loaded and window.google.accounts.id is available. */
  private loadGsiClient(timeout = 5000): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const src = 'https://accounts.google.com/gsi/client';
      const w = window as any;

      const check = () => !!(w.google && w.google.accounts && w.google.accounts.id);
      if (check()) return resolve();

      // If script already present, attach handlers or poll
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existing) {
        if (existing.getAttribute('data-gsi-loaded') === '1') {
          // script loaded but accounts.id may not be ready; poll briefly
          const iv = setInterval(() => {
            if (check()) {
              clearInterval(iv);
              resolve();
            }
          }, 100);
          // safety timeout
          setTimeout(() => { clearInterval(iv); reject(new Error('GSI client init timeout')); }, timeout);
          return;
        }
        existing.addEventListener('load', () => { existing.setAttribute('data-gsi-loaded', '1'); resolve(); });
        existing.addEventListener('error', () => reject(new Error('Failed to load GSI client script')));
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => { script.setAttribute('data-gsi-loaded', '1'); resolve(); };
      script.onerror = () => reject(new Error('Failed to load GSI client script'));
      document.head.appendChild(script);

      // timeout to avoid hanging
      setTimeout(() => reject(new Error('GSI client load timeout')), timeout + 200);
    });
  }

  handleCredentialResponse(response: any): void {
    // Handle the Google authentication response here
    // The response.credential will contain the ID token
    console.log('Encoded JWT ID token: ' + response.credential);
    // Forward token to AuthService for processing (persisting, decoding and redirect)
    try {
      this.authService.handleIdToken(response.credential);
    } catch (err) {
      console.error('AuthService failed to handle credential', err);
    }
  }

}
