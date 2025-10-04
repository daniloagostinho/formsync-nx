import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CampoCsv {
  id: number;
  nomeCampo: string;
  valorCampo: string;
  site?: string;
}

@Injectable({ providedIn: 'root' })
export class CampoCsvService {
  private baseUrl = `${environment.apiUrl}/campos/csv`;

  constructor(private http: HttpClient) { }

  uploadCsv(file: File): Observable<CampoCsv[]> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<CampoCsv[]>(`${this.baseUrl}/upload`, fd);
  }

  getAll(): Observable<CampoCsv[]> {
    return this.http.get<CampoCsv[]>(this.baseUrl);
  }

  deleteCampo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
} 