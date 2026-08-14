import type { Locale } from './strings';

export type TutorialPage = { id: string; title: string; body: string };

const en: TutorialPage[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    body:
      'Short tour once. Scaffold you control — not finished security marketing. Condense without sacrificing values.',
  },
  {
    id: 'values',
    title: 'Values floor',
    body:
      'We the People: nothing against the Constitution, Bill of Rights, or American values.\n\nNo passable human deepfakes. Distinguishable likeness OK. Adult behind XXX.\n\nCannabis is 100% acceptable in TRV (not medical advice).',
  },
  {
    id: 'identity',
    title: 'Identity',
    body:
      'did:key on this device. Destroy = Restart only after typing your full DID. Social state dies with the path.',
  },
  {
    id: 'freedom',
    title: 'Communication Freedom',
    body:
      'Unlimited human comms on TRV rails with yearly sub OR node-host opt-in (node ON). External carriers out of scope.',
  },
  {
    id: 'leans',
    title: 'Learn without pressure',
    body:
      'Mark interests only if you want. Religion → Christian and Godly learning lean. Politics and others → learn, not recruit.',
  },
  {
    id: 'senses',
    title: 'Sentinel & senses',
    body:
      'Hey Sentinel, camera, listen, search — you start and stop each. Customize tone; RWB shield while looking.',
  },
  {
    id: 'ready',
    title: 'Ready',
    body: 'Create a did:key when you want a path. Replay this from Identity anytime. Stay sovereign.',
  },
];

const es: TutorialPage[] = [
  {
    id: 'welcome',
    title: 'Bienvenido',
    body:
      'Recorrido breve. Andamiaje bajo su control. Condensar sin sacrificar valores.',
  },
  {
    id: 'values',
    title: 'Piso de valores',
    body:
      'Nosotros el Pueblo: nada contra la Constitución ni la Carta de Derechos.\n\nSin deepfakes pasables. Cannabis 100% aceptable en TRV (no consejo médico).',
  },
  {
    id: 'identity',
    title: 'Identidad',
    body:
      'did:key local. Destruir = Reiniciar solo con el DID completo.',
  },
  {
    id: 'freedom',
    title: 'Libertad de comunicación',
    body:
      'Ilimitado en rieles TRV con suscripción anual O nodo anfitrión ENCENDIDO.',
  },
  {
    id: 'leans',
    title: 'Aprender sin presión',
    body:
      'Religión → inclinación cristiana y piadosa. Política → aprender, no reclutar.',
  },
  {
    id: 'senses',
    title: 'Sentinel y sentidos',
    body: 'Usted inicia y detiene cada sentido. Escudo RWB mientras busca.',
  },
  {
    id: 'ready',
    title: 'Listo',
    body: 'Cree un did:key cuando quiera. Puede repetir esta guía. Soberanía.',
  },
];

export function getTutorialPages(locale: Locale): TutorialPage[] {
  return locale === 'es' ? es : en;
}
