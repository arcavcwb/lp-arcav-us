// src/i18n/translations.ts — Todo el texto visible de la landing, en es / en / pt.

export type Lang = "es" | "en" | "pt";
export type LineId = "landing" | "sistema" | "auto";

export const BRAND = {
  name: "ARCAV",
  author: "Armando Castro",
  github: "https://github.com/arcavcwb",
  linkedin: "https://www.linkedin.com/in/armando-castro",
  method: "https://github.com/arcavcwb/arcav-ia-flow",
};

export const LANGS: { code: Lang; label: string; name: string; path: string; locale: string }[] = [
  { code: "es", label: "ES", name: "Español", path: "/es/", locale: "es" },
  { code: "pt", label: "PT", name: "Português", path: "/pt/", locale: "pt_BR" },
  { code: "en", label: "EN", name: "English", path: "/en/", locale: "en_US" },
];

type Link = { label: string; href: string };
export type Shot = { src: string; w: number; h: number; alt: string; caption: string; kind: "desktop" | "phone" | "diagram" };

type Service = {
  id: LineId;
  name: string;
  when: string;
  stops: string[];
  runsOn: string;
};

export type SubProject = {
  line: LineId;
  name: string;
  status: string;
  text: string;
  scope?: string;
  links?: Link[];
};

export type Project = {
  id: string;
  name: string;
  client: string;
  lines: LineId[];
  status?: string;
  before?: string;
  built?: string[];
  parts?: SubProject[];
  links?: Link[];
  shots: Shot[];
};

export type Copy = {
  meta: { title: string; description: string };
  skip: string;
  nav: { lines: string; work: string; start: string; about: string; cta: string; menu: string; language: string };
  hero: {
    title: string;
    lead: string;
    cta: string;
    ctaNote: string;
    secondary: string;
    map: {
      label: string;
      here: string;
      today: [string, string, string, string];
      hub: string;
      dest: Record<LineId, string>;
      legend: string;
    };
  };
  lines: { title: string; intro: string; runsOnLabel: string; items: Service[] };
  work: {
    title: string;
    intro: string;
    before: string;
    built: string;
    visit: string;
    projects: Project[];
  };
  start: { title: string; intro: string; here: string; steps: { title: string; text: string }[]; cta: string };
  about: {
    title: string;
    paragraphs: string[];
    motto: string;
    routeLabel: string;
    route: { place: string; note: string }[];
    method: string;
    methodLink: string;
  };
  contact: {
    title: string;
    lead: string;
    nombre: { label: string; placeholder: string };
    contacto: { label: string; placeholder: string };
    proceso: { label: string; placeholder: string };
    honeypot: string;
    privacy: string;
    submit: string;
    sending: string;
    success: string;
    errors: {
      nombre: Record<"required" | "too_short" | "too_long", string>;
      contacto: Record<"required" | "invalid" | "too_long", string>;
      proceso: Record<"required" | "too_short" | "too_long", string>;
      generic: string;
      network: string;
    };
  };
  footer: { tagline: string; location: string; rights: string; legend: string };
  lineNames: Record<LineId, string>;
};

const shots = {
  centerGas: { src: "/work/center-gas/catalogo.webp", w: 780, h: 1060, kind: "phone" as const },
  radar: { src: "/work/condor-campanas/radar-ofertas/desktop.webp", w: 1440, h: 900, kind: "desktop" as const },
  running: { src: "/work/condor-campanas/condor-running/desktop.webp", w: 1440, h: 900, kind: "desktop" as const },
  monitor: { src: "/work/leadwhats/monitor-decision.webp", w: 1592, h: 706, kind: "diagram" as const },
  zonta: { src: "/work/grupo-zonta/desktop.webp", w: 1440, h: 900, kind: "desktop" as const },
  zon: { src: "/work/z-on/desktop.webp", w: 1440, h: 900, kind: "desktop" as const },
};

const liveLinks = {
  campaigns: "https://lp.condor.com.br/encontro-de-sabores/",
  running: "https://condorrunning.condor.com.br/",
  radar: "https://radardeofertas.condor.com.br/",
  zonta: "https://grupozonta.com.br/",
};

export const translations: Record<Lang, Copy> = {
  es: {
    meta: {
      title: "ARCAV — Sistemas y automatización para negocios que operan por WhatsApp y planillas",
      description:
        "Diseño, programo y mantengo el sistema que ordena tu operación: landings conectadas, sistemas a medida y automatizaciones. Armando Castro, desde Curitiba.",
    },
    skip: "Saltar al contenido",
    nav: {
      lines: "Servicios",
      work: "Proyectos",
      start: "Cómo empezar",
      about: "Quién soy",
      cta: "Cuéntame tu proceso",
      menu: "Menú",
      language: "Idioma",
    },
    hero: {
      title: "Tu negocio no debería depender de WhatsApp, planillas y memoria.",
      lead:
        "Diseño, programo y mantengo el sistema que ordena tu operación: pedidos e inscripciones en un solo lugar, formularios que llegan a quien corresponde y avisos que salen solos.",
      cta: "Cuéntame tu proceso",
      ctaNote: "Tres campos. Te respondo yo.",
      secondary: "Ver proyectos en marcha",
      map: {
        label:
          "Mapa de la operación: WhatsApp, planillas, formularios sueltos y email entran a ARCAV y salen como leads en tu CRM, todo en un sistema y avisos automáticos.",
        here: "Estás aquí",
        today: ["WhatsApp", "Planilla", "Formulario suelto", "Email"],
        hub: "ARCAV",
        dest: { landing: "Leads en tu CRM", sistema: "Todo en un sistema", auto: "Avisos automáticos" },
        legend: "Líneas",
      },
    },
    lines: {
      title: "Tres líneas. Tomas la que tu operación necesita.",
      intro: "Primero entiendo cómo funciona hoy tu proceso. Después elegimos el tramo más corto que lo resuelve.",
      runsOnLabel: "Ya corre en",
      items: [
        {
          id: "landing",
          name: "Landing conectada",
          when: "Para cuando la gente llega, pero el contacto se pierde entre mensajes.",
          stops: ["Visita", "Formulario", "Lead guardado", "Aviso al equipo", "Seguimiento"],
          runsOn: "Rede Condor y Grupo Zonta.",
        },
        {
          id: "sistema",
          name: "Sistema a medida",
          when: "Para cuando la operación ya no cabe en una planilla.",
          stops: ["Pedidos", "Inscripciones y cupos", "Clientes", "Despacho", "Panel del dueño"],
          runsOn: "Center Gás y Rede Condor.",
        },
        {
          id: "auto",
          name: "Automatización",
          when: "Para cuando alguien pasa horas copiando, revisando y avisando a mano.",
          stops: ["WhatsApp", "APIs", "n8n", "Base de datos", "Alerta o reporte"],
          runsOn: "Center Gás y Rede Condor.",
        },
      ],
    },
    work: {
      title: "Estaciones ya construidas.",
      intro: "Proyectos reales, cada uno con su estado real.",
      before: "Antes",
      built: "Qué se construyó",
      visit: "Ver en vivo",
      projects: [
        {
          id: "center-gas",
          name: "Center Gás",
          client: "Distribuidora de gas y agua · Curitiba",
          lines: ["sistema", "auto"],
          status: "Desplegado · antes del lanzamiento con clientes",
          before:
            "Todos los pedidos entraban por el WhatsApp del dueño. En cada chat preguntaba producto, dirección y forma de pago, y después repartía los pedidos entre tres repartidores con audios. Si él no contestaba, el pedido se perdía.",
          built: [
            "Catálogo web al que el cliente llega desde WhatsApp, con alta de dirección por CEP.",
            "Panel de despacho en tiempo real: pedidos nuevos, asignados y en camino.",
            "App para repartidores con la dirección en Google Maps o Waze y el cambio que hay que llevar.",
            "Automatización con n8n que responde el primer mensaje con el enlace al catálogo.",
          ],
          shots: [{ ...shots.centerGas, alt: "Pantalla de entrada del catálogo de Center Gás en el celular", caption: "Catálogo para clientes" }],
        },
        {
          id: "condor",
          name: "Rede Condor",
          client: "Supermercados · Paraná y Santa Catarina",
          lines: ["landing", "sistema", "auto"],
          parts: [
            {
              line: "landing",
              name: "Landings de campaña",
              status: "En vivo",
              text: "Páginas de temporada con inscripción a eventos y cupos en tiempo real, repartidos entre el público de redes y el del CRM.",
              links: [
                { label: "Encontro de Sabores", href: liveLinks.campaigns },
                { label: "Condor Running", href: liveLinks.running },
              ],
            },
            {
              line: "landing",
              name: "Radar de Ofertas",
              status: "En vivo",
              text: "Cada cliente elige su región y entra a la comunidad de ofertas de WhatsApp que le corresponde.",
              links: [{ label: "radardeofertas.condor.com.br", href: liveLinks.radar }],
            },
            {
              line: "auto",
              name: "Monitor de avisos de ofertas",
              status: "En operación",
              text: "Antes, alguien abría los enlaces uno por uno y anotaba en una planilla qué aviso no había llegado. Ahora un monitor lo revisa por comunidad y horario y lo muestra en un panel pensado para una sola pregunta: ¿tengo que hacer algo ahora?",
              scope: "26 comunidades de WhatsApp en 14 regiones (agosto de 2026)",
            },
            {
              line: "sistema",
              name: "Inscripciones a charlas",
              status: "En desarrollo",
              text: "Un formulario que cualquier landing incorpora y que marketing configura desde un panel, sin tocar código. Los cupos no se sobrevenden aunque dos personas se inscriban a la vez.",
            },
          ],
          shots: [
            { ...shots.radar, alt: "Página del Radar de Ofertas de Condor con el selector de región", caption: "Radar de Ofertas" },
            { ...shots.running, alt: "Portada de la landing del circuito Condor Running", caption: "Condor Running" },
            { ...shots.monitor, alt: "Diagrama del monitor: si el aviso no llegó a una comunidad, queda marcado", caption: "Cómo decide el monitor" },
          ],
        },
        {
          id: "grupo-zonta",
          name: "Grupo Zonta",
          client: "Grupo empresarial · Paraná y Santa Catarina",
          lines: ["landing"],
          status: "En vivo",
          before: "El sitio institucional estaba armado en WordPress con Elementor, aunque en la práctica era una página casi estática.",
          built: [
            "Sitio nuevo en Astro servido como HTML estático.",
            "Noticias migradas como contenido propio, con listado y página por nota.",
            "Carrusel de las 7 marcas del grupo.",
          ],
          links: [{ label: "grupozonta.com.br", href: liveLinks.zonta }],
          shots: [{ ...shots.zonta, alt: "Portada del sitio de Grupo Zonta con foto aérea", caption: "grupozonta.com.br" }],
        },
        {
          id: "z-on",
          name: "Z-ON Soluções",
          client: "App financiero del Grupo Zonta",
          lines: ["landing"],
          status: "Auditoría y plan entregados · no publicado",
          before: "Un sitio en WordPress donde cada bloque se arma a mano y un mismo objetivo, como descargar el app, lleva a destinos distintos.",
          built: [
            "Auditoría de las 33 páginas públicas del sitio.",
            "Plan de migración a Astro en 6 fases.",
            "Prototipo de la página principal.",
          ],
          shots: [{ ...shots.zon, alt: "Prototipo de la página principal de Z-ON", caption: "Prototipo, sin publicar" }],
        },
      ],
    },
    start: {
      title: "Empezar es una conversación, no un proyecto.",
      intro: "No necesitas saber qué tecnología usar. Solo contarme qué te quita tiempo.",
      here: "Estás aquí",
      steps: [
        { title: "Me cuentas tu proceso", text: "Tres campos: quién eres, cómo contactarte y qué te quita tiempo hoy." },
        { title: "Lo miramos juntos", text: "Conversamos para entender cómo funciona hoy, qué ya sirve y qué no." },
        { title: "Te propongo el tramo más corto", text: "El alcance más pequeño que resuelve el problema, por escrito." },
        { title: "Lo construyo y lo pongo en marcha", text: "Con pruebas, puesta en producción y acompañamiento." },
      ],
      cta: "Cuéntame tu proceso",
    },
    about: {
      title: "Una sola persona responsable, de punta a punta.",
      paragraphs: [
        "Soy Armando Castro. Empecé en frontend y fui sumando backend, bases de datos, infraestructura y automatización.",
        "Hoy diseño, programo, pongo en producción y mantengo el sistema completo. No hay equipo detrás al que pasarle el problema: si algo no funciona, respondo yo.",
      ],
      motto: "Pequeños en alcance. Serios en ingeniería.",
      routeLabel: "Ruta profesional",
      route: [
        { place: "Venezuela", note: "Inicio y formación" },
        { place: "México", note: "Arkus Nexus · Frontend" },
        { place: "San Diego, EE. UU.", note: "Drata · Frontend React" },
        { place: "Curitiba, Brasil", note: "ARCAV" },
      ],
      method: "Mi forma de trabajar con IA también es pública: quien programa no aprueba su propia entrega.",
      methodLink: "Ver arcav-ia-flow",
    },
    contact: {
      title: "Primera parada: cuéntame tu proceso.",
      lead: "Lo leo yo y te respondo al contacto que dejes.",
      nombre: { label: "Tu nombre y tu negocio", placeholder: "Ej.: Ana, Panadería Central" },
      contacto: { label: "Email o WhatsApp para responderte", placeholder: "ana@negocio.com o +55 41 …" },
      proceso: {
        label: "¿Qué proceso te quita más tiempo hoy?",
        placeholder: "Ej.: los pedidos llegan por WhatsApp, los anoto en una planilla y después aviso a quien reparte.",
      },
      honeypot: "No completes este campo",
      privacy: "Uso estos datos solo para responderte.",
      submit: "Enviar mi proceso",
      sending: "Enviando…",
      success: "Recibido. Te escribo al contacto que dejaste.",
      errors: {
        nombre: { required: "Escribe tu nombre.", too_short: "El nombre es demasiado corto.", too_long: "El nombre es demasiado largo." },
        contacto: {
          required: "Déjame un email o WhatsApp para responderte.",
          invalid: "Revisa el email o el número: no parece válido.",
          too_long: "El contacto es demasiado largo.",
        },
        proceso: {
          required: "Cuéntame brevemente tu proceso.",
          too_short: "Cuéntame un poco más, al menos una frase.",
          too_long: "El texto es demasiado largo; resúmelo un poco.",
        },
        generic: "No se pudo enviar. Tus datos siguen aquí: inténtalo de nuevo en unos minutos.",
        network: "Parece que no hay conexión. Tus datos siguen aquí: inténtalo de nuevo.",
      },
    },
    footer: {
      tagline: "Productos digitales y evolución de procesos",
      location: "Curitiba, Brasil",
      rights: "© 2026 ARCAV by Armando Castro",
      legend: "Líneas",
    },
    lineNames: { landing: "Landing conectada", sistema: "Sistema a medida", auto: "Automatización" },
  },

  pt: {
    meta: {
      title: "ARCAV — Sistemas e automação para negócios que operam por WhatsApp e planilhas",
      description:
        "Projeto, programo e mantenho o sistema que organiza a sua operação: landing pages conectadas, sistemas sob medida e automações. Armando Castro, em Curitiba.",
    },
    skip: "Pular para o conteúdo",
    nav: {
      lines: "Serviços",
      work: "Projetos",
      start: "Como começar",
      about: "Quem sou",
      cta: "Conte seu processo",
      menu: "Menu",
      language: "Idioma",
    },
    hero: {
      title: "Seu negócio não deveria depender de WhatsApp, planilhas e memória.",
      lead:
        "Projeto, programo e mantenho o sistema que organiza a sua operação: pedidos e inscrições em um só lugar, formulários que chegam a quem precisa e avisos que saem sozinhos.",
      cta: "Conte seu processo",
      ctaNote: "Três campos. Quem responde sou eu.",
      secondary: "Ver projetos em andamento",
      map: {
        label:
          "Mapa da operação: WhatsApp, planilhas, formulários soltos e e-mail entram na ARCAV e saem como leads no seu CRM, tudo em um sistema e avisos automáticos.",
        here: "Você está aqui",
        today: ["WhatsApp", "Planilha", "Formulário solto", "E-mail"],
        hub: "ARCAV",
        dest: { landing: "Leads no seu CRM", sistema: "Tudo em um sistema", auto: "Avisos automáticos" },
        legend: "Linhas",
      },
    },
    lines: {
      title: "Três linhas. Você pega a que a sua operação precisa.",
      intro: "Primeiro entendo como o seu processo funciona hoje. Depois escolhemos o trecho mais curto que resolve.",
      runsOnLabel: "Já roda em",
      items: [
        {
          id: "landing",
          name: "Landing conectada",
          when: "Para quando as pessoas chegam, mas o contato se perde entre mensagens.",
          stops: ["Visita", "Formulário", "Lead salvo", "Aviso à equipe", "Acompanhamento"],
          runsOn: "Rede Condor e Grupo Zonta.",
        },
        {
          id: "sistema",
          name: "Sistema sob medida",
          when: "Para quando a operação já não cabe em uma planilha.",
          stops: ["Pedidos", "Inscrições e vagas", "Clientes", "Despacho", "Painel do dono"],
          runsOn: "Center Gás e Rede Condor.",
        },
        {
          id: "auto",
          name: "Automação",
          when: "Para quando alguém passa horas copiando, conferindo e avisando na mão.",
          stops: ["WhatsApp", "APIs", "n8n", "Banco de dados", "Alerta ou relatório"],
          runsOn: "Center Gás e Rede Condor.",
        },
      ],
    },
    work: {
      title: "Estações já construídas.",
      intro: "Projetos reais, cada um com o seu status real.",
      before: "Antes",
      built: "O que foi construído",
      visit: "Ver no ar",
      projects: [
        {
          id: "center-gas",
          name: "Center Gás",
          client: "Distribuidora de gás e água · Curitiba",
          lines: ["sistema", "auto"],
          status: "Publicado · antes do lançamento com clientes",
          before:
            "Todos os pedidos entravam pelo WhatsApp do dono. Em cada conversa ele perguntava produto, endereço e forma de pagamento e depois distribuía os pedidos entre três entregadores por áudio. Se ele não respondia, o pedido se perdia.",
          built: [
            "Catálogo web que o cliente abre pelo WhatsApp, com cadastro de endereço por CEP.",
            "Painel de despacho em tempo real: pedidos novos, atribuídos e a caminho.",
            "App do entregador com o endereço no Google Maps ou Waze e o troco que precisa levar.",
            "Automação com n8n que responde a primeira mensagem com o link do catálogo.",
          ],
          shots: [{ ...shots.centerGas, alt: "Tela de entrada do catálogo da Center Gás no celular", caption: "Catálogo para clientes" }],
        },
        {
          id: "condor",
          name: "Rede Condor",
          client: "Supermercados · Paraná e Santa Catarina",
          lines: ["landing", "sistema", "auto"],
          parts: [
            {
              line: "landing",
              name: "Landing pages de campanha",
              status: "No ar",
              text: "Páginas de temporada com inscrição em eventos e vagas em tempo real, divididas entre o público das redes e o do CRM.",
              links: [
                { label: "Encontro de Sabores", href: liveLinks.campaigns },
                { label: "Condor Running", href: liveLinks.running },
              ],
            },
            {
              line: "landing",
              name: "Radar de Ofertas",
              status: "No ar",
              text: "Cada cliente escolhe a sua região e entra na comunidade de ofertas do WhatsApp correspondente.",
              links: [{ label: "radardeofertas.condor.com.br", href: liveLinks.radar }],
            },
            {
              line: "auto",
              name: "Monitor de avisos de ofertas",
              status: "Em operação",
              text: "Antes, alguém abria os links um por um e anotava numa planilha qual aviso não tinha chegado. Agora um monitor confere por comunidade e horário e mostra num painel pensado para uma só pergunta: preciso fazer algo agora?",
              scope: "26 comunidades de WhatsApp em 14 regiões (agosto de 2026)",
            },
            {
              line: "sistema",
              name: "Inscrições em palestras",
              status: "Em desenvolvimento",
              text: "Um formulário que qualquer landing incorpora e que o marketing configura num painel, sem mexer em código. As vagas não estouram mesmo quando duas pessoas se inscrevem ao mesmo tempo.",
            },
          ],
          shots: [
            { ...shots.radar, alt: "Página do Radar de Ofertas da Condor com o seletor de região", caption: "Radar de Ofertas" },
            { ...shots.running, alt: "Capa da landing do circuito Condor Running", caption: "Condor Running" },
            { ...shots.monitor, alt: "Diagrama do monitor: se o aviso não chegou a uma comunidade, fica marcado", caption: "Como o monitor decide" },
          ],
        },
        {
          id: "grupo-zonta",
          name: "Grupo Zonta",
          client: "Grupo empresarial · Paraná e Santa Catarina",
          lines: ["landing"],
          status: "No ar",
          before: "O site institucional era montado em WordPress com Elementor, embora na prática fosse uma página quase estática.",
          built: [
            "Site novo em Astro servido como HTML estático.",
            "Notícias migradas como conteúdo próprio, com listagem e página por notícia.",
            "Carrossel das 7 marcas do grupo.",
          ],
          links: [{ label: "grupozonta.com.br", href: liveLinks.zonta }],
          shots: [{ ...shots.zonta, alt: "Capa do site do Grupo Zonta com foto aérea", caption: "grupozonta.com.br" }],
        },
        {
          id: "z-on",
          name: "Z-ON Soluções",
          client: "App financeiro do Grupo Zonta",
          lines: ["landing"],
          status: "Auditoria e plano entregues · não publicado",
          before: "Um site em WordPress em que cada bloco é montado à mão e um mesmo objetivo, como baixar o app, leva a destinos diferentes.",
          built: [
            "Auditoria das 33 páginas públicas do site.",
            "Plano de migração para Astro em 6 fases.",
            "Protótipo da página inicial.",
          ],
          shots: [{ ...shots.zon, alt: "Protótipo da página inicial da Z-ON", caption: "Protótipo, não publicado" }],
        },
      ],
    },
    start: {
      title: "Começar é uma conversa, não um projeto.",
      intro: "Você não precisa saber que tecnologia usar. Só me contar o que toma o seu tempo.",
      here: "Você está aqui",
      steps: [
        { title: "Você me conta o seu processo", text: "Três campos: quem você é, como falar com você e o que toma o seu tempo hoje." },
        { title: "Olhamos juntos", text: "Conversamos para entender como funciona hoje, o que já serve e o que não serve." },
        { title: "Proponho o trecho mais curto", text: "O menor escopo que resolve o problema, por escrito." },
        { title: "Construo e coloco para rodar", text: "Com testes, publicação em produção e acompanhamento." },
      ],
      cta: "Conte seu processo",
    },
    about: {
      title: "Uma só pessoa responsável, de ponta a ponta.",
      paragraphs: [
        "Sou Armando Castro. Comecei no frontend e fui somando backend, bancos de dados, infraestrutura e automação.",
        "Hoje projeto, programo, coloco em produção e mantenho o sistema completo. Não existe uma equipe para quem passar o problema: se algo não funciona, quem responde sou eu.",
      ],
      motto: "Pequenos no escopo. Sérios na engenharia.",
      routeLabel: "Trajetória profissional",
      route: [
        { place: "Venezuela", note: "Início e formação" },
        { place: "México", note: "Arkus Nexus · Frontend" },
        { place: "San Diego, EUA", note: "Drata · Frontend React" },
        { place: "Curitiba, Brasil", note: "ARCAV" },
      ],
      method: "A minha forma de trabalhar com IA também é pública: quem programa não aprova a própria entrega.",
      methodLink: "Ver arcav-ia-flow",
    },
    contact: {
      title: "Primeira parada: conte o seu processo.",
      lead: "Eu mesmo leio e respondo no contato que você deixar.",
      nombre: { label: "Seu nome e o seu negócio", placeholder: "Ex.: Ana, Padaria Central" },
      contacto: { label: "E-mail ou WhatsApp para eu responder", placeholder: "ana@negocio.com ou +55 41 …" },
      proceso: {
        label: "Que processo mais toma o seu tempo hoje?",
        placeholder: "Ex.: os pedidos chegam pelo WhatsApp, anoto numa planilha e depois aviso quem entrega.",
      },
      honeypot: "Não preencha este campo",
      privacy: "Uso estes dados só para responder você.",
      submit: "Enviar meu processo",
      sending: "Enviando…",
      success: "Recebido. Vou escrever no contato que você deixou.",
      errors: {
        nombre: { required: "Escreva o seu nome.", too_short: "O nome está curto demais.", too_long: "O nome está longo demais." },
        contacto: {
          required: "Deixe um e-mail ou WhatsApp para eu responder.",
          invalid: "Confira o e-mail ou o número: não parece válido.",
          too_long: "O contato está longo demais.",
        },
        proceso: {
          required: "Conte brevemente o seu processo.",
          too_short: "Conte um pouco mais, pelo menos uma frase.",
          too_long: "O texto está longo demais; resuma um pouco.",
        },
        generic: "Não foi possível enviar. Seus dados continuam aqui: tente de novo em alguns minutos.",
        network: "Parece que você está sem conexão. Seus dados continuam aqui: tente de novo.",
      },
    },
    footer: {
      tagline: "Produtos digitais e evolução de processos",
      location: "Curitiba, Brasil",
      rights: "© 2026 ARCAV by Armando Castro",
      legend: "Linhas",
    },
    lineNames: { landing: "Landing conectada", sistema: "Sistema sob medida", auto: "Automação" },
  },

  en: {
    meta: {
      title: "ARCAV — Systems and automation for businesses that run on WhatsApp and spreadsheets",
      description:
        "I design, build and maintain the system that puts your operation in order: connected landing pages, custom systems and automations. Armando Castro, based in Curitiba.",
    },
    skip: "Skip to content",
    nav: {
      lines: "Services",
      work: "Projects",
      start: "How to start",
      about: "About me",
      cta: "Tell me your process",
      menu: "Menu",
      language: "Language",
    },
    hero: {
      title: "Your business shouldn't run on WhatsApp, spreadsheets and memory.",
      lead:
        "I design, build and maintain the system that puts your operation in order: orders and sign-ups in one place, forms that reach the right person and alerts that send themselves.",
      cta: "Tell me your process",
      ctaNote: "Three fields. I answer personally.",
      secondary: "See projects in motion",
      map: {
        label:
          "Operation map: WhatsApp, spreadsheets, loose forms and email go into ARCAV and come out as leads in your CRM, one system for everything and automatic alerts.",
        here: "You are here",
        today: ["WhatsApp", "Spreadsheet", "Loose forms", "Email"],
        hub: "ARCAV",
        dest: { landing: "Leads in your CRM", sistema: "All in one system", auto: "Automatic alerts" },
        legend: "Lines",
      },
    },
    lines: {
      title: "Three lines. Take the one your operation needs.",
      intro: "First I learn how your process works today. Then we pick the shortest route that solves it.",
      runsOnLabel: "Already running at",
      items: [
        {
          id: "landing",
          name: "Connected landing page",
          when: "For when people show up, but the contact gets lost between messages.",
          stops: ["Visit", "Form", "Lead saved", "Team alert", "Follow-up"],
          runsOn: "Rede Condor and Grupo Zonta.",
        },
        {
          id: "sistema",
          name: "Custom system",
          when: "For when the operation no longer fits in a spreadsheet.",
          stops: ["Orders", "Sign-ups and seats", "Customers", "Dispatch", "Owner's dashboard"],
          runsOn: "Center Gás and Rede Condor.",
        },
        {
          id: "auto",
          name: "Automation",
          when: "For when someone spends hours copying, checking and notifying by hand.",
          stops: ["WhatsApp", "APIs", "n8n", "Database", "Alert or report"],
          runsOn: "Center Gás and Rede Condor.",
        },
      ],
    },
    work: {
      title: "Stations already built.",
      intro: "Real projects, each with its real status.",
      before: "Before",
      built: "What was built",
      visit: "See it live",
      projects: [
        {
          id: "center-gas",
          name: "Center Gás",
          client: "Gas and water distributor · Curitiba",
          lines: ["sistema", "auto"],
          status: "Deployed · before launch with customers",
          before:
            "Every order came in through the owner's WhatsApp. In each chat he asked for the product, address and payment method, then split the orders among three delivery drivers with voice notes. If he didn't answer, the order was lost.",
          built: [
            "A web catalog customers open from WhatsApp, with address sign-up by postal code.",
            "A real-time dispatch board: new, assigned and on-the-way orders.",
            "A driver app with the address in Google Maps or Waze and the change to bring.",
            "An n8n automation that answers the first message with the catalog link.",
          ],
          shots: [{ ...shots.centerGas, alt: "Center Gás catalog entry screen on a phone", caption: "Customer catalog" }],
        },
        {
          id: "condor",
          name: "Rede Condor",
          client: "Supermarkets · Paraná and Santa Catarina, Brazil",
          lines: ["landing", "sistema", "auto"],
          parts: [
            {
              line: "landing",
              name: "Campaign landing pages",
              status: "Live",
              text: "Seasonal pages with event sign-ups and real-time seat counts, split between social media and CRM audiences.",
              links: [
                { label: "Encontro de Sabores", href: liveLinks.campaigns },
                { label: "Condor Running", href: liveLinks.running },
              ],
            },
            {
              line: "landing",
              name: "Radar de Ofertas",
              status: "Live",
              text: "Each customer picks their region and joins the matching WhatsApp deals community.",
              links: [{ label: "radardeofertas.condor.com.br", href: liveLinks.radar }],
            },
            {
              line: "auto",
              name: "Deal-announcement monitor",
              status: "Running",
              text: "Someone used to open the links one by one and note in a spreadsheet which announcement never arrived. Now a monitor checks every community and time slot and shows it on a board built around one question: do I need to act now?",
              scope: "26 WhatsApp communities in 14 regions (August 2026)",
            },
            {
              line: "sistema",
              name: "Talk sign-ups",
              status: "In development",
              text: "A form any landing page can embed and marketing configures from a dashboard, with no code changes. Seats never oversell, even when two people sign up at the same moment.",
            },
          ],
          shots: [
            { ...shots.radar, alt: "Condor's Radar de Ofertas page with the region picker", caption: "Radar de Ofertas" },
            { ...shots.running, alt: "Condor Running circuit landing page hero", caption: "Condor Running" },
            { ...shots.monitor, alt: "Monitor diagram: when an announcement didn't reach a community, it gets flagged", caption: "How the monitor decides" },
          ],
        },
        {
          id: "grupo-zonta",
          name: "Grupo Zonta",
          client: "Business group · Paraná and Santa Catarina, Brazil",
          lines: ["landing"],
          status: "Live",
          before: "The corporate site was built in WordPress with Elementor, even though it was really an almost static page.",
          built: [
            "A new Astro site served as static HTML.",
            "News migrated into proper content, with a listing and a page per story.",
            "A carousel for the group's 7 brands.",
          ],
          links: [{ label: "grupozonta.com.br", href: liveLinks.zonta }],
          shots: [{ ...shots.zonta, alt: "Grupo Zonta site hero with an aerial photo", caption: "grupozonta.com.br" }],
        },
        {
          id: "z-on",
          name: "Z-ON Soluções",
          client: "Grupo Zonta's financial app",
          lines: ["landing"],
          status: "Audit and plan delivered · not published",
          before: "A WordPress site where every block is assembled by hand and the same goal, like downloading the app, leads to different places.",
          built: [
            "An audit of the site's 33 public pages.",
            "A 6-phase migration plan to Astro.",
            "A prototype of the home page.",
          ],
          shots: [{ ...shots.zon, alt: "Prototype of the Z-ON home page", caption: "Prototype, not published" }],
        },
      ],
    },
    start: {
      title: "Starting is a conversation, not a project.",
      intro: "You don't need to know which technology to use. Just tell me what eats your time.",
      here: "You are here",
      steps: [
        { title: "You tell me your process", text: "Three fields: who you are, how to reach you and what eats your time today." },
        { title: "We look at it together", text: "A conversation to understand how it works today, what already works and what doesn't." },
        { title: "I propose the shortest route", text: "The smallest scope that solves the problem, in writing." },
        { title: "I build it and put it to work", text: "With tests, production release and follow-up." },
      ],
      cta: "Tell me your process",
    },
    about: {
      title: "One person accountable, end to end.",
      paragraphs: [
        "I'm Armando Castro. I started in frontend and kept adding backend, databases, infrastructure and automation.",
        "Today I design, build, release and maintain the whole system. There's no team behind me to hand the problem to: if something doesn't work, I'm the one who answers.",
      ],
      motto: "Small in scope. Serious in engineering.",
      routeLabel: "Professional route",
      route: [
        { place: "Venezuela", note: "Start and education" },
        { place: "Mexico", note: "Arkus Nexus · Frontend" },
        { place: "San Diego, USA", note: "Drata · React frontend" },
        { place: "Curitiba, Brazil", note: "ARCAV" },
      ],
      method: "How I work with AI is public too: whoever writes the code never approves their own delivery.",
      methodLink: "See arcav-ia-flow",
    },
    contact: {
      title: "First stop: tell me your process.",
      lead: "I read it myself and reply to the contact you leave.",
      nombre: { label: "Your name and your business", placeholder: "E.g. Ana, Central Bakery" },
      contacto: { label: "Email or WhatsApp so I can reply", placeholder: "ana@business.com or +1 619 …" },
      proceso: {
        label: "Which process takes most of your time today?",
        placeholder: "E.g. orders arrive on WhatsApp, I copy them into a spreadsheet and then tell the driver.",
      },
      honeypot: "Leave this field empty",
      privacy: "I only use this information to reply to you.",
      submit: "Send my process",
      sending: "Sending…",
      success: "Received. I'll write to the contact you left.",
      errors: {
        nombre: { required: "Please write your name.", too_short: "The name is too short.", too_long: "The name is too long." },
        contacto: {
          required: "Leave an email or WhatsApp so I can reply.",
          invalid: "Check the email or number: it doesn't look valid.",
          too_long: "The contact is too long.",
        },
        proceso: {
          required: "Briefly tell me about your process.",
          too_short: "Tell me a little more, at least one sentence.",
          too_long: "The text is too long; please shorten it a bit.",
        },
        generic: "It couldn't be sent. Your text is still here: try again in a few minutes.",
        network: "You seem to be offline. Your text is still here: try again.",
      },
    },
    footer: {
      tagline: "Digital products & process evolution",
      location: "Curitiba, Brazil",
      rights: "© 2026 ARCAV by Armando Castro",
      legend: "Lines",
    },
    lineNames: { landing: "Connected landing page", sistema: "Custom system", auto: "Automation" },
  },
};
