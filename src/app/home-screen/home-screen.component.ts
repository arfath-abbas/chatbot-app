import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';

interface Message {
  content?: string; // Text message content
  image?: string;   // Image message (Base64 or URL)
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

  constructor(private chatService: ChatService) {}

  get activeChat(): ChatSession | null {
    return this.chatSessions[this.activeChatIndex] || null;
  }

  sendMessage() {
    if (this.userInput.trim() || this.pendingFile) {
      if (this.pendingFile) {
        if (!this.isAllowedFile(this.pendingFile.file)) {
          alert('Cannot send the message. Invalid file format.');
          return;
        }

        this.chatService.uploadFile(this.pendingFile.file).subscribe(
          (uploadResponse) => {
            if (this.activeChat) {
              this.activeChat.messages.push({
                content: this.pendingFile?.file.name,
                image: uploadResponse.fileUrl,
                sender: 'user',
              });
            }

            this.pendingFile = null;

            if (this.userInput.trim()) {
              this.sendTextMessage(this.userInput.trim());
            }
          },
          () => {
            if (this.activeChat) {
              this.activeChat.messages.push({ content: 'Failed to upload the file.', sender: 'bot' });
            }
          }
        );
      } else {
        this.sendTextMessage(this.userInput.trim());
      }

      this.userInput = '';
    }
  }

  private sendTextMessage(content: string) {
    if (this.activeChat) {
      this.activeChat.messages.push({ content, sender: 'user' });
    }

    this.chatService.sendMessage({ content }).subscribe(
      (response) => {
        if (this.activeChat) {
          this.activeChat.messages.push({ content: response.text, sender: 'bot' });
        }
      },
      () => {
        if (this.activeChat) {
          this.activeChat.messages.push({ content: 'Failed to get a response from the bot.', sender: 'bot' });
        }
      }
    );
  }

  isAllowedFile(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    return allowedTypes.includes(file.type);
  }

  attachFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!this.isAllowedFile(file)) {
        alert('Invalid file type. Please upload a .pdf, .png, .jpeg, or .txt file.');
        input.value = '';
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        this.pendingFile = { file, preview: reader.result as string };
      };

      reader.readAsDataURL(file);
    }
  }

  createNewChat() {
    this.chatSessions.push({ messages: [] });
    this.activeChatIndex = this.chatSessions.length - 1;
  }

  switchChat(index: number) {
    if (index >= 0 && index < this.chatSessions.length) {
      this.activeChatIndex = index;
    }
  }

  confirmDeleteChat(index: number) {
    this.chatToDeleteIndex = index;
    this.showConfirmationPopup = true;
  }

  deleteChat() {
    if (this.chatToDeleteIndex !== null) {
      this.chatSessions.splice(this.chatToDeleteIndex, 1);

      if (this.chatSessions.length === 0) {
        this.createNewChat();
      } else if (this.chatToDeleteIndex === this.activeChatIndex) {
        this.activeChatIndex = Math.min(this.chatToDeleteIndex, this.chatSessions.length - 1);
      } else if (this.chatToDeleteIndex < this.activeChatIndex) {
        this.activeChatIndex -= 1;
      }

      this.chatToDeleteIndex = null;
      this.showConfirmationPopup = false;
    }
  }

  cancelDelete() {
    this.chatToDeleteIndex = null;
    this.showConfirmationPopup = false;
  }
}
