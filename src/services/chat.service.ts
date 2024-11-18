import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private apiUrl = `${environment.apiUrl}/chat`; // Chat endpoint

    constructor(private http: HttpClient) { }

    // Send message to the backend
    sendMessage(message: { content: string; image?: string }): Observable<{ reply: string }> {
        // Call backend API with message object
        return this.http.post<{ reply: string }>(this.apiUrl, message);
    }


    // Upload file to the backend
    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${environment.apiUrl}/upload`, formData);
    }
}
