import "./globals.css";

export const metadata = {
  title: "Sanfiley Publishing Desk",
  description: "Write once, publish to the right site.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
