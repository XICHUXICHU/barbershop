"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface BarbershopCtx {
  barbershopId: string;
  barbershopName: string;
  barbershopSlug: string;
  loading: boolean;
}

const Ctx = createContext<BarbershopCtx>({
  barbershopId: "",
  barbershopName: "",
  barbershopSlug: "",
  loading: true,
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
  const [shop, setShop] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/barbershops/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setShop({ id: data.id, name: data.name, slug: data.slug }))
      .catch(() => setShop(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <Ctx.Provider
      value={{
        barbershopId: shop?.id ?? "",
        barbershopName: shop?.name ?? "",
        barbershopSlug: shop?.slug ?? slug,
        loading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
