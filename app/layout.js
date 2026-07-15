import "./globals.css";

export const metadata = {
  title: "B Smart Salon The Unisex Salon",
  description: "Experience the apex of urban grooming. A high-end barbershop and styling experience blending classic craftsmanship with modern style.",
  keywords: "barbershop, grooming, hair salon, luxury haircut, beard sculpting, urban grooming",
  authors: [{ name: "B Smart Salon" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
