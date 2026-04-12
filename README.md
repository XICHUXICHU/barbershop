# Barber Shop Web (Multi-tenant)

Este es el repositorio completo de la aplicación de gestión de Barberías. Está construido con una arquitectura moderna usando un **Monorepo** (Turborepo).

## 🚀 Tecnologías y Servicios Usados

### 1. Frontend (Website & Dashboard)
- **Framework Principal:** [Next.js 15 (App Router)](https://nextjs.org/) - Para generar todas las páginas (SSR y Client).
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Tipado estricto.
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) - Diseño responsivo y temas de color consistentes.
- **Iconos:** [Lucide React](https://lucide.dev/) - Sistema de íconos vectoriales SVG.
- **Autenticación (Login):** [Clerk](https://clerk.com/) - Sistema de usuarios, registro y validación (protege las rutas del dashboard y admin).
- **Ubicación:** Servido nativamente bajo la carpeta `apps/web`.
- **Hosting en Producción:** [Vercel](https://vercel.com/) (Ej. `https://barbershop-web-sigma.vercel.app`).

### 2. Backend (API Rest)
- **Framework Principal:** [NestJS](https://nestjs.com/) - Arquitectura escalable para microservicios.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/).
- **ORM / Base de Datos:** [Prisma](https://www.prisma.io/) - Mapador relacional a objetos de última generación.
- **Ubicación:** Servido bajo la carpeta `apps/api`.
- **Hosting en Producción:** [Render](https://render.com/) (Ej. `https://barbershop-api-zq76.onrender.com`).

### 3. Servicios Externos y Nube (SaaS)
- **Base de Datos Serverless:** [Neon PostgreSQL](https://neon.tech/) - Aloja las tablas de Barberías, Barberos, Citas, Servicios y Clientes.
- **Gestión de Imágenes:** [Cloudinary](https://cloudinary.com/) - CDN que almacena y recorta las portadas de las barberías, avatares de barberos e imágenes de los servicios subidas temporalmente con `multer`.
- **Control de Versiones y Repositorio:** [GitHub](https://github.com/) (`https://github.com/XICHUXICHU/barbershop.git`).

## ⚠️ Sobre las contraseñas y accesos (MUY IMPORTANTE)
Nunca se deben subir las contraseñas o llaves de API a GitHub por motivos de seguridad, ya que cualquier persona o bot podría verlas y robar datos. 

He creado un archivo llamado **`SECRETS_Y_ACCESOS.md`** directamente en tu computadora que contiene **todas tus llaves, usuarios y links reales de Cloudinary, Neon DB, etc.** 

Ese archivo ha sido configurado para que sea ignorado por Git (nunca se subirá a internet). Guárdalo bien o cópialo en tus notas personales.

## 🛠 Comando para desarrollar localmente

Para encender todo de golpe (Frontend y Backend) en tu computadora:

```bash
npm run dev
```

Esto abrirá:
- Frontend en: `http://localhost:3000`
- Backend API en: `http://localhost:4000/api`
