// src/i18n/translations.ts — Contenido multilingüe oficial para ARCAV

export type Lang = "es" | "en" | "pt";

export const BRAND = {
  name: "ARCAV",
  tagline: "Digital products & process evolution",
  author: "Armando Castro",
  location: "Curitiba, Brasil",
  email: "hola@arcav.us",
  github: "https://github.com/arcavcwb",
  linkedin: "https://www.linkedin.com/in/armando-castro",
  social: [
    { name: "GitHub", href: "https://github.com/arcavcwb" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/armando-castro" }
  ]
};

export const LANGS: { code: Lang; label: string; path: string }[] = [
  { code: "es", label: "ES", path: "/es" },
  { code: "en", label: "EN", path: "/en" },
  { code: "pt", label: "PT", path: "/pt" }
];

export type Copy = {
  metaTitle: string;
  metaDescription: string;
  nav: {
    work: string;
    services: string;
    method: string;
    about: string;
    contact: string;
    cta: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    statement: string;
    trajectory: string;
  };
  problem: {
    label: string;
    title: string;
    copy: string;
    from: string;
    to: string;
    quote: string;
  };
  services: {
    label: string;
    title: string;
    subtitle: string;
    s1: { title: string; desc: string; flow: string };
    s2: { title: string; desc: string; flow: string };
    s3: { title: string; desc: string; flow: string };
  };
  cases: {
    label: string;
    title: string;
    c1: { title: string; tag: string; desc: string; insight: string };
    c2: { title: string; tag: string; desc: string; insight: string };
    c3: { title: string; tag: string; desc: string; insight: string; repo?: string };
  };
  method: {
    label: string;
    title: string;
    steps: string[];
  };
  about: {
    label: string;
    title: string;
    copy: string;
    trajectory: string;
    statement: string;
  };
  contact: {
    title: string;
    subtitle: string;
    nameLabel: string;
    emailLabel: string;
    msgLabel: string;
    submit: string;
    success: string;
  };
  footer: {
    location: string;
    trajectory: string;
    copyright: string;
  };
};

export const translations: Record<Lang, Copy> = {
  es: {
    metaTitle: "ARCAV — Productos Digitales & Evolución de Procesos",
    metaDescription: "Transformo procesos de negocio en productos digitales simples, automatizados y fáciles de operar. By Armando Castro.",
    nav: {
      work: "Trabajo",
      services: "Servicios",
      method: "Método",
      about: "Sobre mí",
      contact: "Contacto",
      cta: "Hablemos →"
    },
    hero: {
      eyebrow: "DIGITAL PRODUCTS & PROCESS EVOLUTION by Armando Castro",
      title: "Transformo procesos de negocio en productos digitales simples, automatizados y fáciles de operar.",
      subtitle: "Landing pages, sistemas pequeños e integraciones para negocios que necesitan ordenar su operación, centralizar información y reducir trabajo manual.",
      primaryCta: "Ver proyectos →",
      secondaryCta: "Hablemos",
      statement: "PEQUEÑOS EN ALCANCE. SERIOS EN INGENIERÍA.",
      trajectory: "Venezuela → México → San Diego / USA → Curitiba / Brasil"
    },
    problem: {
      label: "02 / EL PROBLEMA",
      title: "Cuando el negocio crece, el proceso también tiene que evolucionar.",
      copy: "WhatsApp, hojas de cálculo y formularios pueden funcionar durante mucho tiempo. El problema aparece cuando la demanda aumenta y la operación empieza a depender de información dispersa y tareas manuales.",
      from: "Manual → Disperso → Difícil de controlar",
      to: "Conectado → Automatizado → Visible",
      quote: "No modernizo por modernizar. Primero entiendo qué funciona y qué realmente necesita cambiar."
    },
    services: {
      label: "03 / SERVICIOS",
      title: "Soluciones enfocadas en resultados reales.",
      subtitle: "Tres áreas de trabajo, un mismo objetivo: convertir procesos en productos digitales simples, operables y con impacto real.",
      s1: {
        title: "01 — Landing pages conectadas",
        desc: "Diseño y desarrollo landing pages conectadas a formularios, CRM, bases de datos, notificaciones y automatizaciones.",
        flow: "Visita → Formulario → Lead → Automatización → Seguimiento"
      },
      s2: {
        title: "02 — Sistemas pequeños",
        desc: "Backoffices, CRM específicos, reservas, gestión de eventos, pedidos, inventario y herramientas internas.",
        flow: "Problema → Flujo → Sistema → Operación"
      },
      s3: {
        title: "03 — Automatización e integración",
        desc: "Integro herramientas y automatizo procesos mediante APIs, n8n, webhooks, bases de datos, Sheets y formularios.",
        flow: "Sistema A → Integración → Datos → Acción / Reporte"
      }
    },
    cases: {
      label: "04 / TRABAJO SELECCIONADO",
      title: "Ideas que ya operan.",
      c1: {
        title: "De operación manual a producto digital",
        tag: "PRODUCT / FULL STACK / OPERATIONS",
        desc: "Un producto completo construido para la operación real: flujo, interfaz, backend, base de datos, reglas de negocio y despliegue.",
        insight: "Construir una interfaz es diferente a hacerse responsable de que el producto completo funcione."
      },
      c2: {
        title: "Integrar sin invadir",
        tag: "AUTOMATION / APIs / DATA",
        desc: "Capa de integración independiente para consumir datos autorizados, relacionar registros y automatizar sin destruir el sistema original.",
        insight: "No todo problema necesita una migración."
      },
      c3: {
        title: "Diseñar el sistema que construye el sistema",
        tag: "AI / PRODUCT ENGINEERING / GOVERNANCE",
        desc: "Metodología propia de desarrollo con agentes de IA para gobernar el producto separando arquitectura, dev, QA y release.",
        insight: "No utilizo IA únicamente para programar más rápido. La utilizo para mejorar todo el proceso de construcción.",
        repo: "https://github.com/arcavcwb/arcav-ia-flow"
      }
    },
    method: {
      label: "05 / MÉTODO",
      title: "Del problema al producto.",
      steps: [
        "01. Entender — La necesidad real en palabras del cliente.",
        "02. Mapear — Usuarios, procesos, datos y puntos críticos.",
        "03. Simplificar — Objetivo principal y alcance claro.",
        "04. Construir — Producto, integración e infraestructura.",
        "05. Observar — Logs, métricas, reportes y uso real.",
        "06. Mejorar — Iterar sobre evidencia empírica."
      ]
    },
    about: {
      label: "06 / SOBRE MÍ",
      title: "La tecnología tiene más valor cuando resuelve problemas reales.",
      copy: "Soy Armando Castro, desarrollador de producto y creador de ARCAV. Empecé mi carrera especializado en frontend y amplié mi trabajo hacia backend, bases de datos, infraestructura y automatización.",
      trajectory: "Venezuela → México → San Diego / USA → Curitiba / Brasil",
      statement: "Las herramientas cambian. El problema de negocio viene primero."
    },
    contact: {
      title: "¿Tienes un proceso que puede evolucionar?",
      subtitle: "Hablemos y exploremos cómo convertirlo en un producto digital simple, conectado y fácil de operar.",
      nameLabel: "Nombre o Empresa",
      emailLabel: "Correo Electrónico",
      msgLabel: "Describe tu proceso o necesidad",
      submit: "Enviar mensaje →",
      success: "¡Mensaje recibido! Nos pondremos en contacto pronto."
    },
    footer: {
      location: "Curitiba, Brasil",
      trajectory: "Venezuela → México → USA → Brasil",
      copyright: "© 2026 ARCAV by Armando Castro. Todos los derechos reservados."
    }
  },
  en: {
    metaTitle: "ARCAV — Digital Products & Process Evolution",
    metaDescription: "Transforming business processes into simple, automated, and easy-to-operate digital products. By Armando Castro.",
    nav: {
      work: "Work",
      services: "Services",
      method: "Method",
      about: "About",
      contact: "Contact",
      cta: "Let's talk →"
    },
    hero: {
      eyebrow: "DIGITAL PRODUCTS & PROCESS EVOLUTION by Armando Castro",
      title: "Transforming business processes into simple, automated, and easy-to-operate digital products.",
      subtitle: "Landing pages, small business systems, and integrations for teams that need operational order and manual work reduction.",
      primaryCta: "View projects →",
      secondaryCta: "Let's talk",
      statement: "SMALL IN SCOPE. SERIOUS IN ENGINEERING.",
      trajectory: "Venezuela → Mexico → San Diego / USA → Curitiba / Brazil"
    },
    problem: {
      label: "02 / THE PROBLEM",
      title: "When business grows, the process must evolve.",
      copy: "Spreadsheets and WhatsApp work well for a while. Problems arise when operations start depending on scattered information and manual tasks.",
      from: "Manual → Scattered → Hard to control",
      to: "Connected → Automated → Visible",
      quote: "I don't modernize for the sake of modernizing. First I understand what works and what truly needs to change."
    },
    services: {
      label: "03 / SERVICES",
      title: "Solutions focused on real results.",
      subtitle: "Three work areas, one goal: converting processes into simple, operable digital products.",
      s1: {
        title: "01 — Connected Landing Pages",
        desc: "Designing and developing landing pages connected to forms, CRMs, databases, notifications, and automations.",
        flow: "Visit → Form → Lead → Automation → Follow-up"
      },
      s2: {
        title: "02 — Small Business Systems",
        desc: "Custom backoffices, lightweight CRMs, booking systems, event tools, and internal operational portals.",
        flow: "Problem → Flow → System → Operation"
      },
      s3: {
        title: "03 — Automation & Integration",
        desc: "Integrating existing tools and automating manual workflows via APIs, n8n, webhooks, and databases.",
        flow: "System A → Integration → Data → Action / Report"
      }
    },
    cases: {
      label: "04 / SELECTED WORK",
      title: "Ideas already in operation.",
      c1: {
        title: "From manual task to digital product",
        tag: "PRODUCT / FULL STACK / OPERATIONS",
        desc: "A complete product built around real business operations: flow, interface, backend, database, and deployment.",
        insight: "Building an interface is different from taking responsibility for the complete product."
      },
      c2: {
        title: "Integrate without invading",
        tag: "AUTOMATION / APIs / DATA",
        desc: "Independent integration layer to consume authorized data and automate without breaking original systems.",
        insight: "Not every problem needs a complete migration."
      },
      c3: {
        title: "Designing the system that builds systems",
        tag: "AI / PRODUCT ENGINEERING / GOVERNANCE",
        desc: "Proprietary agentic software development methodology separating architecture, dev, QA, and release.",
        insight: "I don't use AI just to code faster. I use it to improve the entire product building process.",
        repo: "https://github.com/arcavcwb/arcav-ia-flow"
      }
    },
    method: {
      label: "05 / METHOD",
      title: "From problem to product.",
      steps: [
        "01. Understand — The real business need.",
        "02. Map — Users, workflows, data, and critical points.",
        "03. Simplify — Clear scope and core goal.",
        "04. Build — Product, integration, and infrastructure.",
        "05. Observe — Logs, metrics, and actual usage.",
        "06. Improve — Iterate based on empirical evidence."
      ]
    },
    about: {
      label: "06 / ABOUT ME",
      title: "Technology has more value when it solves real problems.",
      copy: "I'm Armando Castro, product developer and creator of ARCAV. I started my career in frontend and expanded into backend, databases, infrastructure, and automation.",
      trajectory: "Venezuela → Mexico → San Diego / USA → Curitiba / Brazil",
      statement: "Tools change. The business problem comes first."
    },
    contact: {
      title: "Have a process that can evolve?",
      subtitle: "Let's talk and explore how to turn it into a simple, connected, and operable digital product.",
      nameLabel: "Name or Company",
      emailLabel: "Email Address",
      msgLabel: "Describe your process or need",
      submit: "Send message →",
      success: "Message received! We'll get back to you soon."
    },
    footer: {
      location: "Curitiba, Brazil",
      trajectory: "Venezuela → Mexico → USA → Brazil",
      copyright: "© 2026 ARCAV by Armando Castro. All rights reserved."
    }
  },
  pt: {
    metaTitle: "ARCAV — Produtos Digitais & Evolução de Processos",
    metaDescription: "Transformo processos de negócios em produtos digitais simples, automatizados e fáceis de operar. Por Armando Castro.",
    nav: {
      work: "Trabalho",
      services: "Serviços",
      method: "Método",
      about: "Sobre mim",
      contact: "Contato",
      cta: "Falar com Armando →"
    },
    hero: {
      eyebrow: "DIGITAL PRODUCTS & PROCESS EVOLUTION por Armando Castro",
      title: "Transformo processos de negócios em produtos digitais simples, automatizados e fáceis de operar.",
      subtitle: "Landing pages, sistemas enxutos e integrações para empresas que precisam organizar sua operação e reduzir trabalho manual.",
      primaryCta: "Ver projetos →",
      secondaryCta: "Falar com Armando",
      statement: "FOCADOS EM ESCOPO. SÉRIOS EM ENGENHARIA.",
      trajectory: "Venezuela → México → San Diego / EUA → Curitiba / Brasil"
    },
    problem: {
      label: "02 / O PROBLEMA",
      title: "Quando o negócio cresce, o processo também precisa evoluir.",
      copy: "Planilhas e WhatsApp funcionam bem por um tempo. O problema surge quando a operação passa a depender de dados dispersos e tarefas manuais.",
      from: "Manual → Disperso → Difícil de controlar",
      to: "Conectado → Automatizado → Visível",
      quote: "Não modernizo por modernizar. Primeiro entendo o que funciona e o que realmente precisa mudar."
    },
    services: {
      label: "03 / SERVIÇOS",
      title: "Soluções focadas em resultados reais.",
      subtitle: "Três áreas de atuação, um mesmo objetivo: converter processos em produtos digitais simples e operáveis.",
      s1: {
        title: "01 — Landing pages conectadas",
        desc: "Design e desenvolvimento de landing pages integradas a formulários, CRM, banco de dados e automações.",
        flow: "Visita → Formulário → Lead → Automação → Acompanhamento"
      },
      s2: {
        title: "02 — Sistemas enxutos",
        desc: "Backoffices sob medida, CRMs específicos, gestão de agendamentos, eventos e ferramentas internas.",
        flow: "Problema → Fluxo → Sistema → Operação"
      },
      s3: {
        title: "03 — Automação e integração",
        desc: "Integro ferramentas e automatizo processos via APIs, n8n, webhooks e bancos de dados existentes.",
        flow: "Sistema A → Integração → Dados → Ação / Relatório"
      }
    },
    cases: {
      label: "04 / TRABALHO SELECIONADO",
      title: "Ideias que já operam.",
      c1: {
        title: "De tarefa manual a produto digital",
        tag: "PRODUCT / FULL STACK / OPERATIONS",
        desc: "Um produto completo construído para operação real: fluxo, interface, backend, banco de dados e deploy.",
        insight: "Construir uma interface é diferente de se responsabilizar pelo funcionamento completo do produto."
      },
      c2: {
        title: "Integrar sem invadir",
        tag: "AUTOMATION / APIs / DATA",
        desc: "Camada de integração independente para consumir dados autorizados e automatizar sem quebrar sistemas legados.",
        insight: "Nem todo problema precisa de uma migração completa."
      },
      c3: {
        title: "Projetar o sistema que constrói sistemas",
        tag: "AI / PRODUCT ENGINEERING / GOVERNANCE",
        desc: "Metodologia própria de desenvolvimento agêntico separando arquitetura, dev, QA e deploy.",
        insight: "Não uso IA apenas para programar mais rápido. Uso para melhorar todo o processo de construção.",
        repo: "https://github.com/arcavcwb/arcav-ia-flow"
      }
    },
    method: {
      label: "05 / MÉTODOS",
      title: "Do problema ao produto.",
      steps: [
        "01. Entender — A necessidade real do negócio.",
        "02. Mapear — Usuários, fluxos, dados e pontos críticos.",
        "03. Simplificar — Escopo claro e objetivo principal.",
        "04. Construir — Produto, integração e infraestrutura.",
        "05. Observar — Logs, métricas e uso real.",
        "06. Melhorar — Iterar com base em evidências."
      ]
    },
    about: {
      label: "06 / SOBRE MIM",
      title: "A tecnologia tem mais valor quando resolve problemas reais.",
      copy: "Sou Armando Castro, desenvolvedor de produtos e criador da ARCAV. Comecei minha carreira no frontend e expandi minha atuação para backend, banco de dados, infraestrutura e automação.",
      trajectory: "Venezuela → México → San Diego / EUA → Curitiba / Brasil",
      statement: "Ferramentas mudam. O problema do negócio vem em primeiro lugar."
    },
    contact: {
      title: "Tem um processo que pode evoluir?",
      subtitle: "Vamos conversar e explorar como transformá-lo em um produto digital simples e fácil de operar.",
      nameLabel: "Nome ou Empresa",
      emailLabel: "E-mail de Contato",
      msgLabel: "Descreva seu processo ou necessidade",
      submit: "Enviar mensagem →",
      success: "Mensagem recebida! Entraremos em contato em breve."
    },
    footer: {
      location: "Curitiba, Brasil",
      trajectory: "Venezuela → México → EUA → Brasil",
      copyright: "© 2026 ARCAV por Armando Castro. Todos os direitos reservados."
    }
  }
};
