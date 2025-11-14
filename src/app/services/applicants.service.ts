import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class ApplicantsService {
  private base = `${API_URL}/applicants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.base, payload);
  }

  update(id: string, payload: any): Observable<any> {
    
    return this.http.put<any>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/${id}`);
  }
}
