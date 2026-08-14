import "./globals.css";

export const metadata = {
  title: 'HMT Platform',
  description: 'Hackathon Management Tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
