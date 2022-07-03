export interface NameProvider {
  name: string;
  names?: Record<string, string>;
  init?: () => void;
  getTarget: (name: string) => string | undefined | null;
}
