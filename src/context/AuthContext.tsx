import type { User } from "firebase/auth";
import { createContext, useState, type ReactNode, type SetStateAction } from "react";

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<SetStateAction<User | null>>;
};

export const AuthContext = createContext<AuthContextType>();

interface AuthProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthProps) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{user, setUser}}>
      {children}
    </AuthContext.Provider>  
  );
};
