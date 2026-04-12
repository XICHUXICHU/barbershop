# Barber Shop Web (Multi-tenant)

Este es el repositorio completo de la aplicación de gestión de Barberías. Está construido con una arquitectura moderna usando un **Monorepo** (Turborepo).

## 🚀 Tecnologías y Servicios Usados

1. **Frontend (Website & Dashboard)**
   - **Framework:** Next.js 15 (App Router)
   - **Diseño:** Tailwind CSS v4
   - **Iconos:** Lucide React
   - **Ubicación:** Carpeta `apps/web`
   - **Hosting recomendado:** [Vercel](https://vercel.com/) (Pendiente de despliegue)

2. **Backend (API Rest)**
   - **Framework:** NestJS
   - **ORM:** Prisma
   - **Ubicación:** Carpeta `apps/api`
   - **Hosting recomendado:** [Render](https://render.com/) o [Railway](https://railway.app/)

3. **Base de Datos**
   - **Proveedor:** [Neon](https://neon.tech/) (PostgreSQL Serverless)
   - Contiene todas las tablas (Barberías, Servicios, Citas, Barberos, Horarios).

4. **Almacenamiento de Imágenes**
   - **Proveedor:** [Cloudinary](https://cloudinary.com/)
   - Se utiliza para subir logos de barberías, portadas y fotos de los servicios desde el backend.

5. **Control de Versiones**
   - **Proveedor:** [GitHub](https://github.com/) 
   - URL Repositorio: `https://github.com/XICHUXICHU/barbershop.git`

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
