
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

/**
 * Build an AuthConfig at runtime. Keep `requireHttps` disabled for local/dev
 * environments where the app may be served over plain HTTP.
 */
export function getAuthConfig(): AuthConfig {
	const redirect = (typeof window !== 'undefined' && window.location && window.location.origin)
		? window.location.origin + '/dashboard'
		: 'http://localhost:4200/dashboard';

	return {
		issuer: 'https://accounts.google.com',
		strictDiscoveryDocumentValidation: false,
		clientId: '621152386206-ipgjnritkuf1bck4d1ipjp0vp32jh4tv.apps.googleusercontent.com',
		redirectUri: redirect,
		scope: 'openid profile email',
		// allow HTTP for local development; set to `true` in production behind HTTPS
		requireHttps: false,
	} as AuthConfig;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private oAuthService = inject(OAuthService);
	private router = inject(Router);

	profile = signal<any>(null);

	constructor() {
		this.initConfiguration();
	}

	/**
	 * Log the user out: clear local token, reset profile, and navigate to login.
	 */
	logout() {
		try {
			// clear stored token
			if (typeof window !== 'undefined') {
				localStorage.removeItem('id_token');
			}
			// clear signal
			this.profile.set(null);
			// attempt OAuthService logout if available
			try { this.oAuthService.logOut(); } catch (e) { /* ignore */ }
			// navigate to login/root
			try { this.router.navigate(['/login']); } catch (e) { /* ignore */ }
		} catch (err) {
			console.error('Logout failed', err);
		}
	}

	initConfiguration() {
		try {
			this.oAuthService.configure(getAuthConfig());
			this.oAuthService.setupAutomaticSilentRefresh();
			this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(() => {
				if (this.oAuthService.hasValidIdToken()) {
					this.profile.set(this.oAuthService.getIdentityClaims());
				}
			});
		} catch (err) {
			console.warn('OAuth configuration skipped or failed:', err);
		}
			// If a token was stored by GSI (localStorage), initialize profile from it so
			// isAuthenticated() reflects the logged-in state immediately.
			try {
				const stored = (typeof window !== 'undefined') ? localStorage.getItem('id_token') : null;
				if (stored) {
					try {
						const payload = JSON.parse(atob(stored.split('.')[1]));
						this.profile.set(payload);
					} catch (_) { /* ignore */ }
				}
			} catch (_) { /* ignore */ }
	}

	login() {
		try { this.oAuthService.initImplicitFlow(); } catch (e) { console.error(e); }
	}

	/**
	 * Return whether the user is currently authenticated according to the OAuth service.
	 */
	isAuthenticated(): boolean {
		try {
				// Consider user authenticated if OAuthService reports a valid token OR
				// if we have an id_token persisted by GSI (local dev flow).
				const hasLocal = (typeof window !== 'undefined') ? !!localStorage.getItem('id_token') : false;
				return hasLocal || (!!this.oAuthService && this.oAuthService.hasValidIdToken());
		} catch (err) {
			return false;
		}
	}

	/**
	 * Process an ID token from Google Identity Services (or other provider).
	 * For now we store it locally and navigate to the dashboard. In a real app
	 * you should verify the token on the server and create a proper session.
	 */
	handleIdToken(token: string) {
		try {
			if (!token) return;
			// persist token (simple approach - replace with secure storage & server validation)
			localStorage.setItem('id_token', token);

			// Optionally decode the token to extract basic profile information
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				this.profile.set(payload);
			} catch (_e) {
				// ignore decode errors
			}

			// navigate to dashboard
			try { this.router.navigate(['/dashboard']); } catch (e) { /* ignore */ }
		} catch (err) {
			console.error('Failed to handle id token', err);
		}
	}
}