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
    console.log('Active chat:', chat);
    return chat || null;
  }

  // Sends the user's message (combines text and file if present)
  sendMessage() {
    if (this.userInput.trim() || this.pendingFile) {
      // Ensure content is always a string
      const userMessage = {
        content: this.userInput.trim() || '', // Default to an empty string if no text
        image: this.pendingFile?.preview || undefined, // Include the image if available
      };

      // Add the combined message to the active chat
      if (this.activeChat) {
        this.activeChat.messages.push({
          content: userMessage.content,
          image: userMessage.image,
          sender: 'user',
        });
      }

      // Clear the input and pending file
      this.userInput = '';
      this.pendingFile = null;

      // Send the message to the backend
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

  // Handles file attachment
  attachFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        // Set the file as pending with a preview
        this.pendingFile = { file, preview: reader.result as string };
      };

      reader.readAsDataURL(file); // Convert file to Base64
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
        // If the deleted chat is the active chat, update to a valid session
        this.activeChatIndex = Math.min(this.chatToDeleteIndex, this.chatSessions.length - 1);
      } else if (this.chatToDeleteIndex < this.activeChatIndex) {
        // Shift active index if a preceding chat was deleted
        this.activeChatIndex -= 1;
      }

      if (this.chatSessions.length === 0) {
        // If no chats are left, create a new chat
        this.createNewChat();
      }

      this.chatToDeleteIndex = null; // Reset the delete index
      this.showConfirmationPopup = false; // Hide the popup
    }
  }

  // Cancels chat deletion
  cancelDelete() {
    this.chatToDeleteIndex = null; // Reset the index
    this.showConfirmationPopup = false; // Hide the popup
  }
}
