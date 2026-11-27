declare module '@grafana/data' {
  import type { ComponentType } from 'react';

  export interface DataFrame {
    fields: readonly { name: string; type: string; values: readonly unknown[] }[];
  }

  export interface PanelProps<Options> {
    options: Options;
    width: number;
    height: number;
    data: { series: readonly DataFrame[]; state: string; error?: unknown };
  }

  interface PanelOptionsBuilder<Options> {
    addTextInput(option: { path: keyof Options; name: string; description?: string; defaultValue: string }): this;
    addNumberInput(option: { path: keyof Options; name: string; defaultValue: number; settings: { min: number; max: number } }): this;
  }

  export class PanelPlugin<Options> {
    constructor(component: ComponentType<PanelProps<Options>>);
    setPanelOptions(configure: (builder: PanelOptionsBuilder<Options>) => PanelOptionsBuilder<Options>): this;
  }

  export const FieldType: { number: 'number' };
  export class DataSourceApi {}

  export class DataSourcePlugin<Source extends DataSourceApi> {
    constructor(source: new (...args: never[]) => Source);
    setConfigEditor(component: ComponentType): this;
    setQueryEditor<Props>(component: ComponentType<Props>): this;
  }
}

declare module '@grafana/runtime' {
  export const config: { appSubUrl: string };
  export function getBackendSrv(): { get(path: string): Promise<unknown> };
}

declare function define(dependencies: string[], factory: (
  react: typeof import('react'),
  data: typeof import('@grafana/data'),
  runtime: typeof import('@grafana/runtime'),
) => unknown): void;
