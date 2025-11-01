// Mock Bot for development when real Telegram bot is not available

export class MockTelegramBot {
  private commands: Map<string, Function> = new Map();
  
  constructor() {
    console.log('🤖 Mock Telegram Bot initialized (development mode)');
  }

  onText(pattern: RegExp, callback: Function) {
    const command = pattern.source.replace(/[\/\\]/g, '').replace(/\$.*/, '');
    this.commands.set(command, callback);
    console.log(`📝 Mock bot registered command: /${command}`);
  }

  on(event: string, callback: Function) {
    console.log(`📝 Mock bot registered event: ${event}`);
  }

  async sendMessage(chatId: number | string, message: string) {
    console.log(`📤 Mock bot would send to ${chatId}:`);
    console.log(message);
    console.log('---');
    return Promise.resolve({ message_id: Date.now() });
  }

  async getChatMember(chatId: string, userId: number) {
    console.log(`👤 Mock bot checking membership: user ${userId} in chat ${chatId}`);
    return Promise.resolve({ status: 'member' });
  }

  // Simulate command execution for testing
  simulateCommand(command: string, mockMessage: any = {}) {
    const callback = this.commands.get(command);
    if (callback) {
      const defaultMessage = {
        chat: { id: 12345 },
        from: { id: 67890 },
        text: `/${command}`,
        ...mockMessage
      };
      
      console.log(`🎯 Simulating command: /${command}`);
      callback(defaultMessage);
    } else {
      console.log(`❌ Command not found: /${command}`);
    }
  }

  // List all registered commands
  listCommands() {
    console.log('📋 Registered commands:');
    this.commands.forEach((_, command) => {
      console.log(`  - /${command}`);
    });
  }
}

export function createMockBot() {
  return new MockTelegramBot();
}