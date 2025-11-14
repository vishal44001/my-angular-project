import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidenavService {
  private toggleSubject = new Subject<void>();
  toggle$ = this.toggleSubject.asObservable();

  toggle() {
    this.toggleSubject.next();
  }

  open() {
    this.toggleSubject.next();
  }

  close() {
    this.toggleSubject.next();
  }
}
