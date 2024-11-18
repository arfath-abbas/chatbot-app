import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private apiUrl = 'http://127.0.0.1:8000';

    constructor(private http: HttpClient) { }

    sendMessage(message: { content: string; image?: string }): Observable<{ text: string }> {
        const url = `${this.apiUrl}/query/?query=${encodeURIComponent(message.content)}`;
        return this.http.get<{ text: string }>(url);
    }

    uploadFile(file: File): Observable<{ message: string; fileUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<{ message: string; fileUrl: string }>(`${this.apiUrl}/upload/`, formData);
    }
}
