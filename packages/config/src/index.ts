import { readFile } from "node:fs/promises";

export type StoreConfig = {
  storeName: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
  defaultLocale: string;
  verticals: string[];
  features: Record<string, boolean>;
};

export type ThemeConfig = {
  brand: {
    name: string;
    primary: string;
    accent: string;
    surface: string;
  };
  layout: {
    radius: string;
    maxWidth: string;
  };
};

export async function loadJsonConfig<TConfig>(path: string): Promise<TConfig> {
  const file = await readFile(path, "utf8");
  return JSON.parse(file) as TConfig;
}
