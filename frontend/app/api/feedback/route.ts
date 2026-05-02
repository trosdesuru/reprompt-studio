import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 [AUDITORÍA - PASO 1] Next.js recibe del Modal:", body);

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_WEBHOOK_URL;

    if (!GOOGLE_SCRIPT_URL) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Falta GOOGLE_SCRIPT_WEBHOOK_URL");
      }
      return NextResponse.json({ error: "Falta URL" }, { status: 500 });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("🚀 [AUDITORÍA - PASO 2] Enviando a Google...");
    }
    const googleRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Leemos la respuesta como texto crudo por si Google nos devuelve un HTML de error
    const googleText = await googleRes.text();
    if (process.env.NODE_ENV === "development") {
      console.log("📨 [AUDITORÍA - PASO 3] Respuesta CRUDA de Google:", googleText);
    }

    if (!googleRes.ok) {
      throw new Error(`Google rechazó con status: ${googleRes.status}`);
    }

    return NextResponse.json({ success: true, googleResponse: googleText });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("🔥 [AUDITORÍA - ERROR FATAL]:", error);
    }
    return NextResponse.json({ error: "Fallo" }, { status: 500 });
  }
}
