export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
      <div
        className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
        aria-hidden
      />
      <p className="text-base text-muted-foreground">{message}</p>
    </div>
  )
}
