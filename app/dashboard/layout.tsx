export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}