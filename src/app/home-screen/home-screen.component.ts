import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';

interface Message {
  content: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss'],
})
export class HomeScreenComponent {
  userInput: string = '';
  messages: Message[] = [];
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private chatService: ChatService) { }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ content: this.userInput, sender: 'user' });

      // Clear the input
      const userMessage = this.userInput;
      this.userInput = '';

      // Scroll to the bottom
      this.scrollToBottom();

      // Send the message to the bot
      this.chatService.sendMessage(userMessage).subscribe(
        (res) => {
          this.messages.push({ content: res.reply, sender: 'bot' });
          this.scrollToBottom();
        },
        () => {
          this.messages.push({
            content: 'An error occurred. Please try again later.',
            sender: 'bot',
          });
          this.scrollToBottom();
        }
      );
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }
}
