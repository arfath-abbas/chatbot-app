import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private apiUrl = `${environment.apiUrl}/chat`; // Backend chat API endpoint
    private fileUploadUrl = `${environment.apiUrl}/upload`; // Backend file upload API endpoint

    constructor(private http: HttpClient) { }

    // Send message to backend
    sendMessage(message: string): Observable<{ reply: string }> {
        return this.http.post<{ reply: string }>(this.apiUrl, { message });
    }

    // Upload a file to the backend
    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(this.fileUploadUrl, formData);
    }
}
