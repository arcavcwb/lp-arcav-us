# ARCAV Landing Page (lp-arcav-us)

Sitio web landing page y portafolio multilenguaje (ES / EN / PT) para ARCAV, desarrollado con **Astro** y configurado para despliegue en **Cloudflare Workers**.

---

## 🚀 Estructura del Proyecto

```text
/
├── docs/                 # Marca, contenido, casos, sistema de diseño y propuestas
├── public/               # Assets estáticos
├── src/                  # Componentes, i18n, layouts y páginas Astro
│   └── pages/
│       ├── index.astro   # Detección y redirección de idioma
│       ├── es/, en/, pt/ # Páginas por idioma (Coming Soon)
│       └── draft.astro   # Borrador de la landing completa
└── package.json
```

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local |
| `npm run build` | Genera la build de producción en `./dist/` |
| `npm run preview` | Previsualiza la build localmente |
