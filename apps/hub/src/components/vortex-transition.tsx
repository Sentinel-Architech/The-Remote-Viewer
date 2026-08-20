import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { FluidRipple } from "./fluid-ripple";

export function VortexTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [show, setShow] = useState(false);
  const [vortex, setVortex] = useState(0.2);

  useEffect(() => {
    setShow(true);
    setVortex(7.5);
    const t1 = window.setTimeout(() => setVortex(0.4), 420);
    const t2 = window.setTimeout(() => setShow(false), 720);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 mix-blend-screen opacity-80">
      <FluidRipple
        viscosity={0.18}
        waveStrength={0.7}
        colorMap="abyss"
        vortex={vortex}
        interactive={false}
      />
    </div>
  );
}
