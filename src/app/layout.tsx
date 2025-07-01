import './globals.css';

export const metadata = {
  title: 'Bike-Life-UK',
  description: 'Find and connect with other UK bikers near you',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      </html>
    );
}
