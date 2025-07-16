import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starboard - Industrial Property Comparables",
  description: "Find and analyze comparable industrial properties with AI-powered insights and interactive visualizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
