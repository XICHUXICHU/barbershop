import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberBook — Reserva tu cita online",
  description:
    "Plataforma de reservas online para barberías. Agenda tu corte de pelo en segundos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
