"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { finishRecipe } from "@/app/actions";
import { phaseLabel } from "@/lib/monsi";

type Phase = { id: string; title: string; action: string; speed?: number | null; reverse?: boolean; temperatureC?: number | null; minutes: number; lid: string; ingredients: string[]; expectedResult?: string | null; tips: string[] };

export default function CookMode({ recipe }: { recipe: { id: string; title: string; phases: Phase[] } }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(recipe.phases[0]?.minutes * 60 ?? 0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const phase = recipe.phases[index];

  useEffect(() => { if (!phase) return; setSeconds(phase.minutes * 60); setRunning(false); }, [index, phase]);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = setInterval(() => setSeconds((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [running, seconds]);

  if (!phase) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isHot = (phase.temperatureC ?? 0) >= 120;

  return (
    <>
      <h1>{recipe.title}</h1>
      {!finished ? (
        <>
          <div className={`card phase ${isHot ? "amber" : "green"}`}>
            <strong>Fase {index + 1} de {recipe.phases.length}: {phase.title}</strong>
            <p>{phaseLabel(phase)}</p>
            <p className="muted">Mete: {phase.ingredients.join(", ") || "nada más"}</p>
            {phase.expectedResult && <p>Debe quedar: {phase.expectedResult}</p>}
            {phase.tips.map((tip) => <p className="muted" key={tip}>💡 {tip}</p>)}
          </div>
          <div className="card">
            <div className="timer">{mm}:{ss}</div>
            <div className="row">
              <button onClick={() => setRunning(!running)}>{running ? "Pausar" : "Empezar"}</button>
              <button className="secondary" onClick={() => setSeconds(phase.minutes * 60)}>Reiniciar</button>
              {index < recipe.phases.length - 1 ? (
                <button className="success" onClick={() => setIndex(index + 1)}>Siguiente fase</button>
              ) : (
                <button className="success" onClick={async () => { await finishRecipe(recipe.id); setFinished(true); }}>Receta cocinada</button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <h2>¿Descontar lo usado?</h2>
          <p className="muted">La app descontará los ingredientes controlados de esta receta.</p>
          <div className="row">
            <button className="success" onClick={() => router.push("/")}>Sí, descontar y volver</button>
            <button className="secondary" onClick={() => router.push("/")}>No descontar</button>
          </div>
        </div>
      )}
    </>
  );
}
