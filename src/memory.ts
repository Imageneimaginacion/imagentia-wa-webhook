export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class ConversationMemory {
  private store: Map<string, ChatMessage[]> = new Map();
  private maxHistory: number = 10;

  getHistory(phone: string): ChatMessage[] {
    return this.store.get(phone) || [];
  }

  addMessage(phone: string, role: 'user' | 'assistant', content: string): void {
    const history = this.getHistory(phone);
    history.push({
      role,
      content,
      timestamp: Date.now()
    });

    if (history.length > this.maxHistory) {
      history.splice(0, history.length - this.maxHistory);
    }

    this.store.set(phone, history);
  }

  clear(phone: string): void {
    this.store.delete(phone);
  }
}

export const memory = new ConversationMemory();
