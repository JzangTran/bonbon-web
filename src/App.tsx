export default function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold text-brand-600">bonbon</h1>
      <p className="text-muted-foreground">Đặt món từ quán ăn trong khu của bạn.</p>
      <div className="flex gap-2">
        <span className="rounded-full bg-success-subtle px-3 py-1 text-sm font-medium text-success-fg">Đã giao</span>
        <span className="rounded-full bg-caramel-400 px-3 py-1 text-sm font-medium text-foreground">Đang chuẩn bị</span>
        <span className="rounded-full bg-danger-subtle px-3 py-1 text-sm font-medium text-danger-fg">Quán từ chối</span>
      </div>
    </main>
  )
}
