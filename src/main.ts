import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Initialize Firebase app before Angular bootstraps so AuthService/getAuth() works.
// Firebase config is read from src/app/api.config.ts -> environment.firebase
import { initializeApp } from 'firebase/app';
// import { environment } from './app/api.config';

// try {
//   const fb = environment && (environment as any).firebase;
//   const hasKeys = fb && Object.keys(fb).length > 0 && fb.apiKey && fb.projectId;
//   if (hasKeys) initializeApp(fb);
// } catch (err) {
//   console.warn('Firebase initialization skipped or failed:', err);
// }

// bootstrapApplication(AppComponent, appConfig)
bootstrapApplication(AppComponent, appConfig)
	.catch((err) => console.error('Bootstrap error', err));
