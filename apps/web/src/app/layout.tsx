import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
    <ClerkProvider>
      <html lang="es">
        <body className="min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
