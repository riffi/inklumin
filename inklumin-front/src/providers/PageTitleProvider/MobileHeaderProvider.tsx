// src/contexts/PageTitleContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { IIcon } from "@/entities/ConstructorEntities";

interface PageAction {
  title: string;
  icon: React.ReactNode;
  handler: () => void;
}

interface PageHeaderProps {
  title: string;
  icon?: IIcon;
  actions?: PageAction[];
}

interface PageTitleContextType {
  pageTitle: string;
  titleElement: React.ReactNode;
  header: PageHeaderProps | null;
  setHeader: (header: PageHeaderProps | null) => void;
}

const MobileHeaderContext = createContext<PageTitleContextType>({
  pageTitle: "",
  titleElement: null,
  header: null,
  setHeader: () => {},
});

export const useMobileHeader = () => useContext(MobileHeaderContext);

export const MobileHeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [pageTitle, setPageTitleState] = useState("");
  const [titleElement, setTitleElementState] = useState<React.ReactNode>(null);
  const [header, setHeaderState] = useState<PageHeaderProps | null>(null);

  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  const setHeader = (headerProps: PageHeaderProps | null) => {
    if (headerProps) {
      setHeaderState(headerProps);
      setPageTitleState(headerProps.title);
    } else {
      setHeaderState(null);
    }
    setTitleElementState(null);
  };

  return (
    <MobileHeaderContext.Provider
      value={{
        pageTitle,
        titleElement,
        header,
        setHeader,
      }}
    >
      {children}
    </MobileHeaderContext.Provider>
  );
};
