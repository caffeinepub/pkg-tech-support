export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg max-w-[100px]">
      <div className="flex gap-1">
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
