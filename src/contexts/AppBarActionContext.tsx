import { createContext, useContext, useState, ReactNode, FC, PropsWithChildren } from 'react';

interface AppBarActionContextType {
    actions: ReactNode | null;
    setActions: (actions: ReactNode | null) => void;
}

const AppBarActionContext = createContext<AppBarActionContextType | undefined>(undefined);

export const AppBarActionProvider: FC<PropsWithChildren> = ({ children }) => {
    const [actions, setActions] = useState<ReactNode | null>(null);

    return (
        <AppBarActionContext.Provider value={{ actions, setActions }}>
            {children}
        </AppBarActionContext.Provider>
    );
};

export function useAppBarAction() {
    const context = useContext(AppBarActionContext);
    if (context === undefined) {
        throw new Error('useAppBarAction must be used within an AppBarActionProvider');
    }
    return context;
}
