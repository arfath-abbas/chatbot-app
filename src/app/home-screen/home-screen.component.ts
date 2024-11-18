import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';

interface Message {
  content?: string; // Optional for text messages
  image?: string;   // Optional for image messages (Base64 or URL)
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
  showConfirmationPopup: boolean = false;
  chatToDeleteIndex: number | null = null; // Index of the chat to delete

  constructor(private chatService: ChatService) { }

  get activeChat(): ChatSession {
    return this.chatSessions[this.activeChatIndex];
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.activeChat.messages.push({ content: this.userInput, sender: 'user' });

      const userMessage = this.userInput;
      this.userInput = '';

      this.chatService.sendMessage(userMessage).subscribe(
        (response) => {
          this.activeChat.messages.push({ content: response.reply, sender: 'bot' });
        },
        () => {
          this.activeChat.messages.push({ content: 'Failed to get a response from the bot.', sender: 'bot' });
        }
      );
    }
  }

  createNewChat() {
    this.chatSessions.push({ messages: [] });
    this.activeChatIndex = this.chatSessions.length - 1;
  }

  switchChat(index: number) {
    this.activeChatIndex = index;
  }

  attachFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        // Add file as an image message
        this.activeChat.messages.push({ image: reader.result as string, sender: 'user' });
        // Optionally, send the file to the backend
        this.chatService.uploadFile(file).subscribe(
          (response) => {
            this.activeChat.messages.push({ content: 'File uploaded successfully!', sender: 'bot' });
          },
          () => {
            this.activeChat.messages.push({ content: 'Failed to upload the file.', sender: 'bot' });
          }
        );
      };
      // Convert file to Base64
      reader.readAsDataURL(file);
    }
  }

  confirmDeleteChat(index: number) {
    // Store the index of the chat to delete
    this.chatToDeleteIndex = index;
    this.showConfirmationPopup = true;
  }

  deleteChat() {
    if (this.chatToDeleteIndex !== null) {
      this.chatSessions.splice(this.chatToDeleteIndex, 1);

      // Adjust the active chat index
      if (this.chatSessions.length === 0) {
        // Create a new chat if no sessions remain
        this.createNewChat();
      } else if (this.chatToDeleteIndex === this.activeChatIndex) {
        this.activeChatIndex = Math.min(this.chatToDeleteIndex, this.chatSessions.length - 1);
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
