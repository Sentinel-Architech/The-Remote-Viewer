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
      'This short tour appears once for new Viewers. It explains what each part is and why it exists. Nothing here is marketed as finished security — this is a working scaffold you control on your device.',
  },
  {
    id: 'identity',
    title: 'Identity — your local path',
    body:
      'What: A did:key created and stored on this device.\n\nWhy: So presence, signing, and social state belong to you — not a central account server. If you Destroy the path, it ends here. There is no email or phone recovery by The Remote Viewer.',
  },
  {
    id: 'destroy',
    title: 'Destroy = Restart',
    body:
      'What: A high-friction gate. You open Danger Zone and type (or dictate) your full DID exactly.\n\nWhy: Accidental wipes should be hard. Deliberate endings should be possible. No recovery theater — when the path is gone, social state on this device is gone with it.',
  },
  {
    id: 'social',
    title: 'Social layer — connections of your own',
    body:
      'What: On-device connections, optical DID exchange, local messages, profile export, and a portable connection list.\n\nWhy: The Remote Viewer is meant to be a social connection of its own without a central graph. You hold the list; export it if you need portability.',
  },
  {
    id: 'human',
    title: 'Human verification',
    body:
      'What: A local attestation — Male or Female only — saved on this device.\n\nWhy: A clear human category for verification on this Viewer path. It is not inferred from the camera and is wiped if you Destroy the identity.',
  },
  {
    id: 'senses',
    title: 'Senses — sight, hearing, search',
    body:
      'What: Optional camera, listen sessions, and live web search.\n\nWhy: So you can use the Viewer the way you prefer. You turn each sense on and off. Frames and audio are not uploaded to TRV servers.',
  },
  {
    id: 'sentinel',
    title: 'Hey Sentinel',
    body:
      'What: Say “Hey Sentinel” (or “Oye Sentinel”) after you start listen, then ask a question — or type the question.\n\nWhy: When you have a question, Sentinel answers using live open-internet sources, not only notes already on the phone. You start listening; it is not always-on by default.',
  },
  {
    id: 'language',
    title: 'Language & voice',
    body:
      'What: English or Spanish UI, plus Speak and Dictate on many fields.\n\nWhy: So Viewers can work in the language and modality they prefer — text, voice, or both.',
  },
  {
    id: 'ready',
    title: 'You are ready',
    body:
      'Create a did:key when you want a path. Explore Identity, Messages, and Senses at your pace.\n\nThis tour will not show again unless you reopen it from Identity. Build carefully. Stay sovereign.',
  },
];

const es: TutorialPage[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a The Remote Viewer',
    body:
      'Este recorrido breve aparece una vez para nuevos Viewers. Explica qué es cada parte y por qué existe. Nada aquí se presenta como seguridad terminada — es un andamiaje que usted controla en su dispositivo.',
  },
  {
    id: 'identity',
    title: 'Identidad — su ruta local',
    body:
      'Qué: Un did:key creado y guardado en este dispositivo.\n\nPor qué: Para que la presencia, las firmas y el estado social le pertenezcan a usted — no a un servidor de cuentas. Si Destruye la ruta, termina aquí. No hay recuperación por correo o teléfono mediante The Remote Viewer.',
  },
  {
    id: 'destroy',
    title: 'Destruir = Reiniciar',
    body:
      'Qué: Una puerta de alto fricción. Abre la Zona de peligro y escribe (o dicta) su DID completo exactamente.\n\nPor qué: Los borrados accidentales deben ser difíciles. Los finales deliberados deben ser posibles. Sin teatro de recuperación.',
  },
  {
    id: 'social',
    title: 'Capa social — conexiones propias',
    body:
      'Qué: Conexiones en el dispositivo, intercambio óptico de DID, mensajes locales, exportación de perfil y lista portable.\n\nPor qué: The Remote Viewer debe ser una conexión social por sí misma, sin un grafo central. Usted guarda la lista.',
  },
  {
    id: 'human',
    title: 'Verificación humana',
    body:
      'Qué: Una atestación local — solo Hombre o Mujer — guardada en este dispositivo.\n\nPor qué: Una categoría humana clara para verificación en esta ruta. No se infiere de la cámara y se borra si Destruye la identidad.',
  },
  {
    id: 'senses',
    title: 'Sentidos — vista, oído, búsqueda',
    body:
      'Qué: Cámara opcional, sesiones de escucha y búsqueda web en vivo.\n\nPor qué: Para usar el Viewer como prefiera. Usted enciende y apaga cada sentido. Los fotogramas y el audio no se suben a servidores de TRV.',
  },
  {
    id: 'sentinel',
    title: 'Hey Sentinel',
    body:
      'Qué: Diga “Oye Sentinel” o “Hey Sentinel” después de iniciar la escucha, luego su pregunta — o escríbala.\n\nPor qué: Cuando tiene una pregunta, Sentinel responde con fuentes abiertas de internet, no solo con notas del teléfono. Usted inicia la escucha.',
  },
  {
    id: 'language',
    title: 'Idioma y voz',
    body:
      'Qué: Interfaz en inglés o español, más Hablar y Dictar en muchos campos.\n\nPor qué: Para trabajar en el idioma y la modalidad que prefiera — texto, voz, o ambos.',
  },
  {
    id: 'ready',
    title: 'Listo',
    body:
      'Cree un did:key cuando quiera una ruta. Explore Identidad, Mensajes y Sentidos a su ritmo.\n\nEste recorrido no volverá a mostrarse salvo que lo abra de nuevo desde Identidad. Construya con cuidado. Manténgase soberano.',
  },
];

export function getTutorialPages(locale: Locale): TutorialPage[] {
  return locale === 'es' ? es : en;
}
