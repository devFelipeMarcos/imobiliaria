"use client";
import { useEffect, useState } from "react";

// Função que salva no localStorage e avisa a própria aba
function setLocalStorageWithEvent(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(
    new CustomEvent("localstorage:update", { detail: { key, value } })
  );
}

const Teste = () => {
  const [nome, setNome] = useState<string>("");

  // Simulação: grava depois de 4s na mesma aba
  useEffect(() => {
    const timer = setTimeout(() => {
      const name = "Felipe";
      setLocalStorageWithEvent("nome", name);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Escuta apenas os eventos da própria aba
  useEffect(() => {
    const onCustom = (e: Event) => {
      console.log("Alguém mudou ai em", e);
      const { key, value } = (e as CustomEvent).detail as {
        key: string;
        value: string;
      };
      if (key === "nome") {
        setNome(value ?? "");
      }
    };

    // Adiciona o ouvinte
    window.addEventListener("localstorage:update", onCustom as EventListener);

    // Carrega o valor inicial (se já existir)
    const initial = localStorage.getItem("nome");
    if (initial) setNome(initial);

    // Remove o ouvinte ao desmontar o componente
    return () => {
      window.removeEventListener(
        "localstorage:update",
        onCustom as EventListener
      );
    };
  }, []);

  return (
    <div>
      <h1>Teste</h1>
      <button
        onClick={() => setLocalStorageWithEvent("nome", "Atualizado agora")}
      >
        Atualizar nome (mesma aba)
      </button>
      <br />
      <p>Nome: {nome || "Carregando..."}</p>
    </div>
  );
};

export default Teste;
