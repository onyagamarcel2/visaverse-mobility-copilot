export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <div className="w-4 h-4 text-white">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
        </div>
      </div>
    </div>
  )
}
