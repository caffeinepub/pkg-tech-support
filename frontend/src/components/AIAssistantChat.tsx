import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Headphones } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showHandover?: boolean;
}

const IT_KNOWLEDGE_BASE: Record<string, string> = {
  printer: `**Printer Troubleshooting Guide:**

1. **Paper Jam**: Open all printer covers and gently remove jammed paper. Check the paper tray for misaligned sheets.
2. **Driver Issues**: Go to Device Manager → Printers → Right-click → Update Driver. Or download from manufacturer's website.
3. **Not Printing**: Check if printer is set as default. Go to Settings → Devices → Printers & Scanners.
4. **Offline Status**: Restart the print spooler service: Run → services.msc → Print Spooler → Restart.

Would you like more specific help with your printer issue?`,

  'blue screen': `**Blue Screen of Death (BSOD) Fix:**

1. **Note the error code** displayed on the blue screen (e.g., MEMORY_MANAGEMENT, DRIVER_IRQL).
2. **Restart in Safe Mode**: Hold Shift while clicking Restart → Troubleshoot → Advanced → Startup Settings.
3. **Check for driver updates**: Device Manager → Look for yellow warning icons.
4. **Run Windows Memory Diagnostic**: Search "Windows Memory Diagnostic" in Start menu.
5. **Check disk health**: Open CMD as admin → type \`chkdsk /f /r\`

If the issue persists, a technician can run deeper diagnostics.`,

  'slow computer': `**Speed Up Your Computer:**

1. **Disable startup programs**: Task Manager (Ctrl+Shift+Esc) → Startup tab → Disable unnecessary apps.
2. **Clear temp files**: Press Win+R → type \`%temp%\` → Delete all files.
3. **Run Disk Cleanup**: Search "Disk Cleanup" → Select C: drive → Clean up system files.
4. **Check for malware**: Run Windows Defender full scan.
5. **Upgrade RAM**: If you have less than 8GB, consider upgrading.
6. **Defragment HDD**: Only for traditional hard drives, not SSDs.`,

  password: `**Password & Account Help:**

1. **Forgot Password**: Click "Forgot Password" on the login screen → Follow email reset instructions.
2. **Account Locked**: Wait 15-30 minutes for automatic unlock, or contact IT admin.
3. **Change Password**: Ctrl+Alt+Del → Change a password (Windows) or System Preferences → Users (Mac).
4. **Enable MFA**: Go to account settings → Security → Two-factor authentication.
5. **Password Manager**: Consider using a password manager like Bitwarden or LastPass.

⚠️ Never share your password with anyone, including IT staff.`,

  wifi: `**Wi-Fi Connectivity Issues:**

1. **Basic Reset**: Turn Wi-Fi off and on again. Forget the network and reconnect.
2. **Restart Router**: Unplug for 30 seconds, then plug back in. Wait 2 minutes.
3. **Check IP Settings**: Run CMD → \`ipconfig /release\` then \`ipconfig /renew\`
4. **Flush DNS**: CMD as admin → \`ipconfig /flushdns\`
5. **Update Network Driver**: Device Manager → Network Adapters → Update driver.
6. **Check for interference**: Move closer to router, avoid microwave/cordless phone interference.`,

  network: `**Network Connectivity Troubleshooting:**

1. **Ping Test**: Open CMD → \`ping 8.8.8.8\` to test internet connectivity.
2. **Check cables**: Ensure Ethernet cables are firmly connected.
3. **Restart network stack**: CMD as admin → \`netsh winsock reset\` → Restart PC.
4. **Check firewall**: Windows Defender Firewall → Ensure it's not blocking your app.
5. **VPN issues**: Disconnect VPN and test. Some VPNs block certain connections.`,

  email: `**Email Troubleshooting:**

1. **Can't send/receive**: Check internet connection first. Verify email server settings.
2. **Outlook not opening**: Run as administrator. Try Outlook Safe Mode: Hold Ctrl while opening.
3. **Full mailbox**: Delete old emails or archive them. Empty Deleted Items folder.
4. **Spam issues**: Check spam/junk folder. Add sender to safe senders list.
5. **Sync issues**: Remove and re-add email account in settings.`,
};

function getBotResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  for (const [keyword, response] of Object.entries(IT_KNOWLEDGE_BASE)) {
    if (lower.includes(keyword)) {
      return response;
    }
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! 👋 I'm your IT Support AI Assistant. I can help you with:

• 🖨️ **Printer issues** (paper jams, drivers, offline)
• 💻 **Windows problems** (blue screen, slow performance)
• 🔑 **Password & account** (reset, locked accounts)
• 📶 **Network & Wi-Fi** (connectivity, no internet)
• 📧 **Email issues** (Outlook, sync problems)

What IT issue can I help you with today?`;
  }

  if (lower.includes('thank')) {
    return "You're welcome! 😊 Is there anything else I can help you with? If you need further assistance, you can always talk to one of our human technicians.";
  }

  return `I understand you're having an IT issue. Let me help you better!

I can assist with these common topics:
• **Printer problems** - type "printer"
• **Blue screen / BSOD** - type "blue screen"  
• **Slow computer** - type "slow computer"
• **Password reset** - type "password"
• **Wi-Fi issues** - type "wifi"
• **Network problems** - type "network"
• **Email issues** - type "email"

Or click **"Talk to a Human"** below to connect with a live technician who can provide personalized support.`;
}

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello! 👋 I'm your IT Support AI Assistant. I can help you with common IT issues like printer problems, Windows troubleshooting, password resets, and network connectivity.

What can I help you with today?`,
      timestamp: new Date(),
      showHandover: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const botResponse = getBotResponse(userMsg.content);
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: botResponse,
      timestamp: new Date(),
      showHandover: true,
    };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleHandover = () => {
    const handoverMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I'll connect you with a human technician right away! 🎧

**Your chat history has been saved.** A technician will review your conversation and provide personalized support.

Please go to the **Chat** tab to connect with an available technician. They'll be able to see the context of your issue.`,
      timestamp: new Date(),
      showHandover: false,
    };
    setMessages(prev => [...prev, handoverMsg]);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i} dangerouslySetInnerHTML={{ __html: boldLine + (i < content.split('\n').length - 1 ? '<br/>' : '') }} />
      );
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-sm">IT Support AI Assistant</p>
          <p className="text-xs opacity-80">Always available • Instant answers</p>
        </div>
        <Badge className="ml-auto bg-green-500 text-white text-xs border-0">Online</Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] space-y-2`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  {formatContent(msg.content)}
                </div>
                {msg.showHandover && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={handleHandover}
                  >
                    <Headphones className="w-3 h-3 mr-1" />
                    Talk to a Human
                  </Button>
                )}
                <p className="text-xs text-muted-foreground px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about any IT issue..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isTyping} size="icon">
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI assistant • For complex issues, use "Talk to a Human"
        </p>
      </div>
    </div>
  );
}
