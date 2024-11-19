import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ChatService } from '../../services/chat.service';

interface Message {
  content?: string;
  image?: string;
  sender: 'user' | 'bot';
}

interface ChatSession {
  messages: Message[];
}

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss'],
})
export class HomeScreenComponent {
  userInput: string = '';
  chatSessions: ChatSession[] = [{ messages: [] }];
  activeChatIndex: number = 0;
  pendingFile: { file: File; preview: string } | null = null;
  showConfirmationPopup: boolean = false;
  chatToDeleteIndex: number | null = null;

  constructor(private chatService: ChatService, private messageService: MessageService) { }

  get activeChat(): ChatSession | null {
    return this.chatSessions[this.activeChatIndex] || null;
  }

  sendMessage() {
    if (this.userInput.trim() || this.pendingFile) {
      // Handle File Upload
      if (this.pendingFile) {
        if (!this.isAllowedFile(this.pendingFile.file)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid File',
            detail: 'Only .pdf, .png, .jpeg, and .txt files are allowed.'
          });
          return;
        }

        // Add file message to the chat
        if (this.activeChat) {
          this.activeChat.messages.push({
            content: this.pendingFile.file.name,
            image: this.pendingFile.file.type.startsWith('image/') ? this.pendingFile.preview : undefined,
            sender: 'user'
          });
        }

        // Upload File
        this.chatService.uploadFile(this.pendingFile.file).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'File Uploaded',
              detail: 'File uploaded successfully.'
            });
          },
          () => {
            if (this.activeChat) {
              this.activeChat.messages.push({
                content: 'Failed to upload the file.',
                sender: 'bot'
              });
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Upload Failed',
              detail: 'File upload failed.'
            });
          }
        );
      }

      // Handle Text Input
      if (this.userInput.trim()) {
        if (this.activeChat) {
          this.activeChat.messages.push({
            content: this.userInput.trim(),
            sender: 'user'
          });
        }

        // Send text message to backend
        this.chatService.sendMessage({ content: this.userInput.trim() }).subscribe(
          (response) => {
            if (this.activeChat) {
              this.activeChat.messages.push({
                content: response.text,
                sender: 'bot'
              });
            }
          },
          () => {
            if (this.activeChat) {
              this.activeChat.messages.push({
                content: 'Failed to get a response from the bot.',
                sender: 'bot'
              });
            }
          }
        );
      }

      // Reset Input and Pending File
      this.userInput = '';
      this.pendingFile = null;
    }
  }


  attachFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      if (!this.isAllowedFile(file)) {
        this.messageService.add({ severity: 'warn', summary: 'Invalid File', detail: 'Only .pdf, .png, .jpeg, .txt files are allowed.' });
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => (this.pendingFile = { file, preview: reader.result as string });
      reader.readAsDataURL(file);
    }
  }

  isAllowedFile(file: File): boolean {
    return ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'].includes(file.type);
  }

  createNewChat() {
    this.chatSessions.push({ messages: [] });
    this.activeChatIndex = this.chatSessions.length - 1;
    this.messageService.add({ severity: 'info', summary: 'New Chat', detail: 'New chat session started.' });
  }

  switchChat(index: number) {
    this.activeChatIndex = index;
  }

  confirmDeleteChat(index: number) {
    this.chatToDeleteIndex = index;
    this.showConfirmationPopup = true;
  }

  deleteChat() {
    this.chatSessions.splice(this.chatToDeleteIndex!, 1);
    this.activeChatIndex = Math.min(this.activeChatIndex, this.chatSessions.length - 1);
    this.chatToDeleteIndex = null;
    this.showConfirmationPopup = false;
  }

  cancelDelete() {
    this.showConfirmationPopup = false;
  }
}
