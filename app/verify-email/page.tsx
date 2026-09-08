"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Token manquant.");
      return;
    }

    fetch(
      `http://localhost:8000/api/auth/verify-email?token=${encodeURIComponent(token)}`
    )
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Erreur de vérification.");
        }

        setMessage(data.message);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-xl font-semibold">{message}</h1>
    </main>
  );
}