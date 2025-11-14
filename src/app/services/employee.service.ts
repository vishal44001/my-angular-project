import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private base = `${API_URL.replace(/\/+$/, '')}/employees`;
  private isFirebase = API_URL.includes('firebaseio') || API_URL.includes('firebaseio.com') || API_URL.includes('firebaseio');

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    if (this.isFirebase) {
      return this.http.get<{[key:string]: any}>(`${this.base}.json`).pipe(
        map(res => res ? Object.keys(res).map(k => ({ id: k, ...res[k] })) : [])
      );
    }
    return this.http.get<any[]>(this.base);
  }

  get(id: string): Observable<any> {
    if (this.isFirebase) {
      return this.http.get<any>(`${this.base}/${id}.json`);
    }
    return this.http.get<any>(`${this.base}/${id}`);
  }

  create(payload: any): Observable<any> {
    if (this.isFirebase) {
      // POST to Firebase will return { name: '<generated-key>' }
      return this.http.post<any>(`${this.base}.json`, payload).pipe(
        map(res => ({ id: res && res.name ? res.name : null, ...payload }))
      );
    }
    return this.http.post<any>(this.base, payload);
  }

  update(id: string, payload: any): Observable<any> {
    if (this.isFirebase) {
      return this.http.put<any>(`${this.base}/${id}.json`, payload).pipe(
        map(res => ({ id, ...(res || payload) }))
      );
    }
    return this.http.put<any>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    if (this.isFirebase) {
      return this.http.delete<any>(`${this.base}/${id}.json`);
    }
    return this.http.delete<any>(`${this.base}/${id}`);
  }
}
