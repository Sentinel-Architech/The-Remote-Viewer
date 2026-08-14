import type { Locale } from './strings';

export type TutorialPage = {
  id: string;
  title: string;
  body: string;
};

const en: TutorialPage[] = [
  {
    id: 'welcome',
    title: 'Welcome to The Remote Viewer',
    body:
      'This short tour appears once for new Viewers. It explains what each part is and why it exists. This is a working scaffold you control on your device — not finished security marketing.',
  },
  {
    id: 'identity',
    title: 'Identity — your local path',
    body:
      'What: A did:key created and stored on this device.\n\nWhy: Presence, signing, and social state belong to you — not a central account server. Destroy ends the path here. No email or phone recovery by TRV.',
  },
  {
    id: 'destroy',
    title: 'Destroy = Restart',
    body:
      'What: Danger Zone — type or dictate your full DID exactly.\n\nWhy: Accidental wipes should be hard. Deliberate endings should be possible. No recovery theater.',
  },
  {
    id: 'social',
    title: 'Social layer',
    body:
      'What: On-device connections, optical DID exchange, local messages, profile export.\n\nWhy: The Remote Viewer is a social connection of its own without a central graph.',
  },
  {
    id: 'freedom',
    title: 'Communication Freedom',
    body:
      'What: Talk, text, voice, web, and other human channels on TRV rails are FREE and UNLIMITED if you have a yearly subscription OR you opt to host as a node and keep it ON.\n\nWhy: Subscribers fund the network; node hosts are rewarded for keeping the mesh active and safer. External carrier minutes are out of scope.',
  },
  {
    id: 'human',
    title: 'Human verification',
    body:
      'What: Local attestation — Male or Female only.\n\nWhy: A clear human category on this path. Not inferred from the camera. Wiped on Destroy.',
  },
  {
    id: 'deepfake',
    title: 'Likeness and deepfakes',
    body:
      'What: Human likeness and animation are OK only when clearly distinguishable from real humanity. Adult content sits behind XXX (default blocked).\n\nWhy: Passable deepfakes of real people are STRICTLY PROHIBITED. Trust between humans is the line.',
  },
  {
    id: 'conduct',
    title: 'Community and IA of IA',
    body:
      'What: Mute, report, or block any Viewer who has gone too far. The IA of IA drafts an anonymous formal private inquiry — what was wrong and how — then uses replies to steer Sentinel conduct.\n\nWhy: Viewers act first; recursive governance learns from the community without corporate theater.',
  },
  {
    id: 'senses',
    title: 'Senses and Hey Sentinel',
    body:
      'What: Optional camera, listen, live search, and Hey Sentinel (internet-backed answers). Customize Sentinel name and tone. RWB holographic shield spins while looking.\n\nWhy: Use the Viewer the way you prefer. You start and stop each sense.',
  },
  {
    id: 'ready',
    title: 'You are ready',
    body:
      'Create a did:key when you want a path. Explore Identity, Messages, and Senses at your pace.\n\nReplay this guide anytime from Identity. Build carefully. Stay sovereign.',
  },
];

const es: TutorialPage[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a The Remote Viewer',
    body:
      'Este recorrido breve aparece una vez. Explica qué es cada parte y por qué existe. Es un andamiaje que usted controla — no marketing de seguridad terminada.',
  },
  {
    id: 'identity',
    title: 'Identidad — su ruta local',
    body:
      'Qué: Un did:key en este dispositivo.\n\nPor qué: La presencia y el estado social le pertenecen. Destruir termina la ruta aquí.',
  },
  {
    id: 'destroy',
    title: 'Destruir = Reiniciar',
    body:
      'Qué: Zona de peligro — DID completo exacto.\n\nPor qué: Los borrados accidentales deben ser difíciles.',
  },
  {
    id: 'social',
    title: 'Capa social',
    body:
      'Qué: Conexiones, intercambio óptico, mensajes locales, perfil.\n\nPor qué: Conexión social propia sin grafo central.',
  },
  {
    id: 'freedom',
    title: 'Libertad de comunicación',
    body:
      'Qué: Canales humanos TRV GRATIS e ILIMITADOS con suscripción anual O anfitrión de nodo ENCENDIDO.\n\nPor qué: Recompensa a quien mantiene la red activa.',
  },
  {
    id: 'human',
    title: 'Verificación humana',
    body:
      'Qué: Atestación local — solo Hombre o Mujer.\n\nPor qué: Categoría humana clara. No de la cámara.',
  },
  {
    id: 'deepfake',
    title: 'Semejanza y deepfakes',
    body:
      'Qué: Semejanza y animación OK solo si son distinguibles de la humanidad real. Adulto detrás de XXX.\n\nPor qué: Deepfakes pasables de personas reales están ESTRICTAMENTE PROHIBIDOS.',
  },
  {
    id: 'conduct',
    title: 'Comunidad e IA de IA',
    body:
      'Qué: Silenciar, reportar o bloquear. La IA de IA consulta en privado (anónimo y formal) y orienta la conducta del Sentinel.\n\nPor qué: Primero los Viewers; luego la gobernanza recursiva.',
  },
  {
    id: 'senses',
    title: 'Sentidos y Hey Sentinel',
    body:
      'Qué: Cámara, escucha, búsqueda y Hey Sentinel. Tono personalizado. Escudo RWB mientras busca.\n\nPor qué: Usted inicia y detiene cada sentido.',
  },
  {
    id: 'ready',
    title: 'Listo',
    body:
      'Cree un did:key cuando quiera. Puede repetir esta guía desde Identidad. Manténgase soberano.',
  },
];

export function getTutorialPages(locale: Locale): TutorialPage[] {
  return locale === 'es' ? es : en;
}
