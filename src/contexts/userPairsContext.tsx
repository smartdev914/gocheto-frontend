import React, { useEffect, useState, createContext, Dispatch, SetStateAction, useContext } from "react";
import { useActiveWeb3React } from "src/hooks";

interface UserPairsContextProps {
  totalTVL: number;
  setTvls: Dispatch<SetStateAction<number[]>>;
  setTotalPairs: Dispatch<SetStateAction<number>>;
}

const userPairsContext = createContext<UserPairsContextProps | undefined>(undefined);

export const usePairsContext = (): UserPairsContextProps => {
  const context = useContext(userPairsContext);
  if(!context) {
    throw new Error('usePairsContext must be used within a UserPairsProvider');
  }
  return context;
}

export const UserPairsProvider = ({ children }) => {
  const [tvls, setTvls] = useState<number[]>([]);
  const [totalTVL, setTotalTVL] = useState<number>(0);
  const [totalPairs, setTotalPairs] = useState<number>(0);
  const { chainId, account } = useActiveWeb3React();

  useEffect(() => {
    if(account) {
      if (totalPairs > 0) {
        if(tvls.length <= totalPairs) {
          setTotalTVL(tvls.reduce((acc, tvl) => acc + tvl, 0));
        } else {
          setTvls((prev) => prev.slice(0, totalPairs));
        }
      } else {
        setTotalTVL(0);
        setTvls([]);
      }
    }
  }, [chainId, account]);

  useEffect(() => {
    setTvls([]);
  }, [chainId]);

  const value = {
    totalTVL,
    setTvls,
    setTotalPairs
  };

  return <userPairsContext.Provider value={
    value
  }>{children}</userPairsContext.Provider>
}
