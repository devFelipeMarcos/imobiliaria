// lib/formatAnaliseDetalhe.ts

export function formatAnaliseDetalhe(input: string): Record<string, string> {
  return Object.fromEntries(
    input
      .split("\n")
      .filter((linha) => linha.includes(":"))
      .map((linha) => {
        const [chave, ...resto] = linha.split(":");
        return [chave.trim(), resto.join(":").trim()];
      })
  );
}
