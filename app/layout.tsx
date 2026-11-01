import "./globals.css";
import Link from "next/link";

export const metadata = { title: "To pa dentro XL", description: "Recetario XL para La Monsi." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main>{children}</main>
        <nav className="nav">
          <Link href="/">Hoy</Link>
          <Link href="/recetas">Recetas</Link>
          <Link href="/despensa">Despensa</Link>
          <Link href="/compra">Compra</Link>
        </nav>
      </body>
    </html>
  );
}
