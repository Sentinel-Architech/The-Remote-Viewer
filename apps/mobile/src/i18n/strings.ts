/**
 * Opt-in English / Spanish UI strings.
 * Default: English. Preference stored on device.
 */

export type Locale = 'en' | 'es';

export type SexAttestation = 'male' | 'female';

const en = {
  language: 'Language',
  english: 'English',
  spanish: 'Spanish',
  identity: 'Identity',
  messages: 'Messages',
  senses: 'Senses',
  active: 'ACTIVE',
  noIdentity: 'NO IDENTITY',
  createDid: 'Create did:key',
  speakStatus: 'Speak status',
  humanVerification: 'Human verification',
  humanVerificationHint:
    'Local attestation only. Choose Male or Female. Not inferred from camera. Wiped on Destroy. Required for verified-human status on this device.',
  sex: 'Sex',
  male: 'Male',
  female: 'Female',
  notAttested: 'Not attested',
  attest: 'Save attestation',
  attestedAs: 'Attested as',
  verifiedHuman: 'Verified human (local)',
  notVerifiedHuman: 'Not verified human',
  destroyIdentity: 'Destroy identity…',
  dangerZone: 'Danger Zone',
  typeFullDid: 'Type or dictate full DID exactly',
  cancel: 'Cancel',
  destroyConfirm: 'I understand — Destroy',
  matchDid: 'Match DID to enable',
  localProfile: 'Local profile (optional)',
  displayName: 'Display name',
  about: 'About',
  saveProfile: 'Save profile',
  connections: 'Connections (on-device)',
  addConnection: 'Add connection',
  localMessages: 'Local messages',
  content: 'Content',
  sight: 'Sight (camera)',
  hearing: 'Hearing (microphone)',
  liveSearch: 'Live internet search',
  search: 'Search (instant answer)',
  openFullWeb: 'Open full web results',
  enableCamera: 'Enable camera',
  turnCameraOff: 'Turn camera off',
  startListening: 'Start listening',
  stopListening: 'Stop listening',
  speak: 'Speak',
  dictate: 'Dictate',
  listening: 'Listening…',
  resultsFromDdg: 'Results from DuckDuckGo',
  noIdentityHint:
    'Create a local did:key. Use Speak / Dictate on any field. All social state is wiped on Destroy.',
  attestationSaved: 'Human attestation saved on this device.',
  attestationRequired: 'Select Male or Female to attest.',
} as const;

const es: { [K in keyof typeof en]: string } = {
  language: 'Idioma',
  english: 'Inglés',
  spanish: 'Español',
  identity: 'Identidad',
  messages: 'Mensajes',
  senses: 'Sentidos',
  active: 'ACTIVA',
  noIdentity: 'SIN IDENTIDAD',
  createDid: 'Crear did:key',
  speakStatus: 'Leer estado',
  humanVerification: 'Verificación humana',
  humanVerificationHint:
    'Solo atestación local. Elija Hombre o Mujer. No se infiere de la cámara. Se borra al Destruir. Requerido para el estado humano verificado en este dispositivo.',
  sex: 'Sexo',
  male: 'Hombre',
  female: 'Mujer',
  notAttested: 'Sin atestar',
  attest: 'Guardar atestación',
  attestedAs: 'Atestado como',
  verifiedHuman: 'Humano verificado (local)',
  notVerifiedHuman: 'No verificado como humano',
  destroyIdentity: 'Destruir identidad…',
  dangerZone: 'Zona de peligro',
  typeFullDid: 'Escriba o dicte el DID completo exactamente',
  cancel: 'Cancelar',
  destroyConfirm: 'Entiendo — Destruir',
  matchDid: 'Coincida el DID para habilitar',
  localProfile: 'Perfil local (opcional)',
  displayName: 'Nombre para mostrar',
  about: 'Acerca de',
  saveProfile: 'Guardar perfil',
  connections: 'Conexiones (en el dispositivo)',
  addConnection: 'Añadir conexión',
  localMessages: 'Mensajes locales',
  content: 'Contenido',
  sight: 'Vista (cámara)',
  hearing: 'Oído (micrófono)',
  liveSearch: 'Búsqueda en internet en vivo',
  search: 'Buscar (respuesta instantánea)',
  openFullWeb: 'Abrir resultados web completos',
  enableCamera: 'Activar cámara',
  turnCameraOff: 'Apagar cámara',
  startListening: 'Empezar a escuchar',
  stopListening: 'Dejar de escuchar',
  speak: 'Hablar',
  dictate: 'Dictar',
  listening: 'Escuchando…',
  resultsFromDdg: 'Resultados de DuckDuckGo',
  noIdentityHint:
    'Cree un did:key local. Use Hablar / Dictar en cualquier campo. Todo el estado social se borra al Destruir.',
  attestationSaved: 'Atestación humana guardada en este dispositivo.',
  attestationRequired: 'Seleccione Hombre o Mujer para atestar.',
};

const tables: Record<Locale, typeof en> = { en, es };

export function t(locale: Locale, key: keyof typeof en): string {
  return tables[locale][key] ?? tables.en[key];
}

export { en, es };
