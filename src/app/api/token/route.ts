// app/api/token/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const url =
    "https://opencheck.arkeyva.com/auth/realms/th/protocol/openid-connect/token";

  const body = new URLSearchParams({
    username: "api",
    password: "z!22to@TcJFB",
    grant_type: "password",
    client_id: "arkeyva",
  });

  try {
    const response = await axios.post(url, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: "JSESSIONID=F37001EA157CC67EDC32CDA00ABBCD29",
      },
    });

    return NextResponse.json({ token: response.data.access_token });
  } catch (error: any) {
    console.error(
      "Erro ao obter token:",
      error.response?.data || error.message
    );
    return new NextResponse("Erro ao obter token", { status: 500 });
  }
}
