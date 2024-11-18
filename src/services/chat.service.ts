import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private apiUrl = `${environment.apiUrl}/api/chat`; // Adjust endpoint path as needed

    constructor(private http: HttpClient) { }

    sendMessage(message: string): Observable<{ reply: string }> {
        return this.http.post<{ reply: string }>(this.apiUrl, { message });
    }
}
