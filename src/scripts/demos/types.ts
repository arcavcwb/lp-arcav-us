// Contrato entre o palco (scripts/demo-stage.ts) e cada demonstração (scripts/demos/<id>.ts).

export interface DemoContext {
  /** O visitante chegou ao resultado: anuncia `announcement` a leitores de tela e mostra o fechamento. */
  done(announcement: string): void;
}

export interface DemoInstance {
  /** Volta a demonstração ao começo ("Recomeçar"). */
  reset(): void;
}

export interface DemoModule {
  mount(panel: HTMLElement, ctx: DemoContext): DemoInstance;
}
