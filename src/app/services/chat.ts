import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from '../models/chat.model';
  
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'https://chatapi20251116203909.azurewebsites.net'; // 'https://chatapimgmtsvc.azure-api.net/api/chat'; //https://localhost:7119/api/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = { message };
    return this.http.post<ChatResponse>(`${this.apiUrl}/send`, request);
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`); 
  }
}
