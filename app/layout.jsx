import "./globals.css";

export const metadata = {
  title: "Harbor Glass Window Cleaning — Streak-Free Windows, Free Estimates",
  description:
    "Professional residential & commercial window cleaning in Delaware. Screens, tracks, mirrors, skylights & glass doors. Call 302-494-9680 for a free estimate.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
