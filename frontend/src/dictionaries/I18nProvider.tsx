"use client";

import { createContext, useContext } from "react";

const I18nContext = createContext<any>(null);

export const I18nProvider = ({
  children,
  dictionary,
}: {
  children: React.ReactNode;
  dictionary: any;
}) => {
  return <I18nContext.Provider value={dictionary}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const dictionary = useContext(I18nContext);

  if (!dictionary) {
    throw new Error("useTranslation debe usarse dentro de un I18nProvider");
  }

  const t = (key: string): string => {
    const keys = key.split(".");
    let value = dictionary;

    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }

    return value || key;
  };

  return { t };
};
