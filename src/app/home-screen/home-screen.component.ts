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
  userInput: string = ''; // User input text
  chatSessions: ChatSession[] = [{ messages: [] }]; // Array of chat sessions
  activeChatIndex: number = 0; // Index of the active chat session
  pendingFile: { file: File; preview: string } | null = null; // Holds the pending file and its preview
  showConfirmationPopup: boolean = false; // To control popup visibility
  chatToDeleteIndex: number | null = null; // Index of the chat to delete

  constructor(private chatService: ChatService) { }

  // Getter to access the active chat session
  switchChat(index: number) {
    if (index >= 0 && index < this.chatSessions.length) {
      this.activeChatIndex = index;
      console.log('Switched to chat:', this.chatSessions[index]);
    } else {
      console.error('Invalid chat index');
    }
  }

  get activeChat(): ChatSession | null {
    const chat = this.chatSessions[this.activeChatIndex];
    return chat || null;
  }

  // Sends the user's message (combines text and file if present)
  sendMessage() {
    if (this.userInput.trim() || this.pendingFile) {
      if (this.pendingFile && !this.isAllowedFile(this.pendingFile.file)) {
        alert('Cannot send the message. Invalid file format.');
        return;
      }

      const userMessage = {
        content: this.pendingFile?.file.name || this.userInput.trim(),
        image: this.pendingFile?.file.type.startsWith('image/') ? this.pendingFile.preview : undefined,
      };

      if (this.activeChat) {
        this.activeChat.messages.push({
          content: userMessage.content,
          image: userMessage.image,
          sender: 'user',
        });
      }

      this.userInput = '';
      this.pendingFile = null;

      this.chatService.sendMessage(userMessage).subscribe(
        (response) => {
          if (this.activeChat) {
            this.activeChat.messages.push({ content: response.reply, sender: 'bot' });
          }
        },
        () => {
          if (this.activeChat) {
            this.activeChat.messages.push({ content: 'Failed to get a response from the bot.', sender: 'bot' });
          }
        }
      );
    }
  }


  // Helper function to validate file type
  isAllowedFile(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    return allowedTypes.includes(file.type);
  }

  // Handles file attachment
  attachFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Allowed file types
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];

      if (!allowedTypes.includes(file.type)) {
        // Show an error if the file type is not supported
        alert('Invalid file type. Please upload a .pdf, .png, .jpeg, or .txt file.');
        input.value = '';
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        // Set the pending file with a preview
        this.pendingFile = { file, preview: reader.result as string };
      };

      reader.readAsDataURL(file); // Convert the file to a Base64 URL for preview
    }
  }

  // Creates a new chat session
  createNewChat() {
    this.chatSessions.push({ messages: [] }); // Add a new empty chat session
    this.activeChatIndex = this.chatSessions.length - 1; // Set the new chat as active
  }

  // Shows the confirmation popup for deleting a chat
  confirmDeleteChat(index: number) {
    this.chatToDeleteIndex = index; // Store the index of the chat to delete
    this.showConfirmationPopup = true; // Show the confirmation popup
  }

  // Deletes the selected chat session
  deleteChat() {
    if (this.chatToDeleteIndex !== null) {
      this.chatSessions.splice(this.chatToDeleteIndex, 1); // Remove the selected chat session

      // Adjust the active chat index
      if (this.chatToDeleteIndex === this.activeChatIndex) {
        this.activeChatIndex = Math.min(this.chatToDeleteIndex, this.chatSessions.length - 1);
      } else if (this.chatToDeleteIndex < this.activeChatIndex) {
        this.activeChatIndex -= 1;
      }

      if (this.chatSessions.length === 0) {
        // If no chats are left, create a new chat
        this.createNewChat();
      }

      this.chatToDeleteIndex = null;
      this.showConfirmationPopup = false;
    }
  }

  // Cancels chat deletion
  cancelDelete() {
    this.chatToDeleteIndex = null;
    this.showConfirmationPopup = false;
  }
}
