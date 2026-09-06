# Estructura del proyecto

Este proyecto es una interfaz de chat construida con Next.js, React, TypeScript y Tailwind CSS.

```text
/
├── app/
│   ├── page.tsx                 # Pantalla principal y estado del chat
│   ├── layout.tsx               # Layout global, metadata y fuentes
│   └── globals.css              # Variables de tema y estilos globales
│
├── components/
│   ├── chat/
│   │   ├── chat-composer.tsx    # Campo para redactar y enviar mensajes
│   │   ├── chat-header.tsx      # Cabecera y selector de modelo
│   │   ├── conversation-list.tsx # Lista de conversaciones
│   │   ├── message-list.tsx     # Renderizado de mensajes
│   │   ├── token-sidebar.tsx    # Métricas de tokens y costes
│   │   └── usage-bars.tsx       # Barras de uso por turno
│   │
│   └── ui/
│       └── button.tsx           # Botón reutilizable
│
├── lib/
│   ├── chat-data.ts              # Tipos, datos iniciales y lógica del chat
│   └── utils.ts                  # Utilidades compartidas
│
├── public/                       # Iconos e imágenes estáticas
├── chat-data.test.ts             # Prueba relacionada con los datos del chat
├── components.json               # Configuración de componentes UI
├── next.config.mjs               # Configuración de Next.js
├── next-env.d.ts                 # Tipos generados para Next.js
├── package.json                  # Dependencias y scripts del proyecto
├── package-lock.json             # Lockfile de npm
├── pnpm-lock.yaml                # Lockfile de pnpm
├── pnpm-workspace.yaml           # Configuración del workspace de pnpm
├── postcss.config.mjs           # Configuración de PostCSS
├── tsconfig.json                 # Configuración de TypeScript
├── README.md                     # Descripción general del proyecto
├── AGENTS.md                     # Instrucciones para agentes de desarrollo
├── CLAUDE.md                     # Referencia a las instrucciones del proyecto
└── .env-local                    # Variables de entorno locales, no versionar secretos
```

## Directorios excluidos

- `node_modules/`: dependencias instaladas.
- `.next/`: archivos generados por Next.js.
- `.git/`: historial y metadatos del repositorio.

Estos directorios no forman parte de la estructura funcional de la aplicación.
