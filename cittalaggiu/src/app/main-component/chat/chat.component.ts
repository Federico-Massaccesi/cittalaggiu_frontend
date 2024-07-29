import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  messages: { text: string, isBot: boolean }[] = [];
  userMessage: string = '';
  isChatExpanded: boolean = false;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    if (this.userMessage.trim().length > 0) {
      this.messages.push({ text: `User: ${this.userMessage}`, isBot: false });
      this.chatService.sendMessage(this.userMessage).subscribe(response => {
        this.displayBotMessage(response.message);
        this.userMessage = '';
      });
    }
  }

  displayBotMessage(message: string) {
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        const currentMessage = this.messages[this.messages.length - 1];
        if (currentMessage && currentMessage.isBot) {
          currentMessage.text += message.charAt(index);
        } else {
          this.messages.push({ text: message.charAt(index), isBot: true });
        }
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }
}
