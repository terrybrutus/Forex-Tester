declare module "jest-axe" {
  export interface AxeResult {
    violations: Array<{ id: string; description: string }>;
  }

  export function axe(element: Element): Promise<AxeResult>;
}
