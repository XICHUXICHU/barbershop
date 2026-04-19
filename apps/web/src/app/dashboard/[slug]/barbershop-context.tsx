"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface BarbershopCtx {
  barbershopId: string;
  barbershopName: string;
  barbershopSlug: string;
  loading: boolean;
  unauthorized: boolean;
}

const Ctx = createContext<BarbershopCtx>({
  barbershopId: "",
  barbershopName: "",
  barbershopSlug: "",
  loading: true,
  unauthorized: false,
});

export function useBarbershop() {
  return useContext(Ctx);
}

export function BarbershopProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const { user } = useUser();
  const [shop, setShop] = useState<{
    id: string;
    name: string;
    slug: string;
    ownerId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/barbershops/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        const isAdmin = (user.publicMetadata as { role?: string })?.role === "admin";
        if (data.ownerId !== user.id && !isAdmin) {
          setUnauthorized(true);
          setShop(null);
        } else {
          setShop({ id: data.id, name: data.name, slug: data.slug, ownerId: data.ownerId });
        }
      })
      .catch(() => setShop(null))
      .finally(() => setLoading(false));
  }, [slug, user]);

  return (
    <Ctx.Provider
      value={{
        barbershopId: shop?.id ?? "",
        barbershopName: shop?.name ?? "",
        barbershopSlug: shop?.slug ?? slug,
        loading,
        unauthorized,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
