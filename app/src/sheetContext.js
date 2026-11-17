import { createContext, useContext } from 'react';

export const SheetCtx = createContext(null);
export const useSheet = () => useContext(SheetCtx);
