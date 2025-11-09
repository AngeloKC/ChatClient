import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat';
import { ChatMessage } from '../models/chat.model';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  error: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.addBotMessage('Hello! I\'m SimpleChatBot. How can I help you today?');
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    const userMessage = this.newMessage.trim();
    this.addUserMessage(userMessage);
    this.newMessage = '';
    this.isLoading = true;
    this.error = '';

    this.chatService.sendMessage(userMessage).subscribe({
      next: (response) => {
        this.addBotMessage(response.message);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.error = 'Failed to get response. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private addUserMessage(message: string): void {
    this.messages.push({
      message,
      isBot: false,
      timestamp: new Date()
    });
  }

  private addBotMessage(message: string): void {
    this.messages.push({
      message,
      isBot: true,
      timestamp: new Date()
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
