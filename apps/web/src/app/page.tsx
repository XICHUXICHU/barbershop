import Link from "next/link";
import { UserButton, Show, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen px-4 relative">
      {/* Auth Nav */}
      <nav className="absolute top-4 right-6 flex items-center gap-4">
        <Show when="signed-in">
          <Link href="/dashboard" className="text-sm font-medium hover:text-[blue-600] transition-colors">
            Mi Panel
          </Link>
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="text-sm font-medium hover:text-[blue-600] transition-colors">
              Iniciar Sesión
            </button>
          </SignInButton>
        </Show>
      </nav>

      {/* Hero */}
      <header className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-20 mt-16">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          <span className="text-[blue-600]">Barber</span>Book
        </h1>
        <p className="text-xl text-[gray-500] mb-10 leading-relaxed">
          La plataforma para que tu barbería reciba citas online 24/7.
          <br />
          Tus clientes reservan en segundos desde su celular.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl bg-[blue-600] text-gray-900 font-semibold text-lg hover:bg-[blue-700] transition-colors"
          >
            Registra tu Barbería
          </Link>
          <Link
            href="/demo"
            className="px-8 py-4 rounded-xl border border-[blue-600] text-[blue-600] font-semibold text-lg hover:bg-[blue-600] hover:text-gray-900 transition-colors"
          >
            Ver Demo
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pb-20 px-4">
        <FeatureCard
          title="Citas 24/7"
          description="Recibe reservas mientras duermes. Tus clientes agendan solos desde tu link en Instagram o Google."
          icon="📅"
        />
        <FeatureCard
          title="Cero Ausencias"
          description="Recordatorios automáticos por WhatsApp y email reducen las faltas hasta un 70%."
          icon="🔔"
        />
        <FeatureCard
          title="Tu Marca, Tu Página"
          description="Perfil profesional con tus servicios, precios y horarios. Destaca frente a la competencia."
          icon="✂️"
        />
      </section>

      {/* Pricing */}
      <section className="max-w-2xl mx-auto text-center pb-20">
        <h2 className="text-3xl font-bold mb-4">Precio Simple</h2>
        <p className="text-[gray-500] mb-8">
          Sin contratos, sin sorpresas. Cancela cuando quieras.
        </p>
        <div className="bg-[white] rounded-2xl p-8 border border-gray-200">
          <p className="text-5xl font-extrabold mb-2">
            $25{" "}
            <span className="text-lg font-normal text-[gray-500]">
              USD / mes
            </span>
          </p>
          <ul className="mt-6 space-y-3 text-left max-w-sm mx-auto">
            {[
              "Citas ilimitadas",
              "Página pública personalizada",
              "Panel de administración",
              "Recordatorios automáticos",
              "Soporte por WhatsApp",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[gray-500] border-t border-gray-200 w-full">
        © 2026 BarberBook — Hecho con ❤️ para barberos
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-[white] rounded-2xl p-6 border border-gray-200 hover:border-[blue-600] transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[gray-500] leading-relaxed">{description}</p>
    </div>
  );
}
