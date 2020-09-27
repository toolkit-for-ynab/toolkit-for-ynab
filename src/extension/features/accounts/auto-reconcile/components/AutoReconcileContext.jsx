import React, { createContext, useState } from 'react';

export const AutoReconcileContext = createContext();

let initialState = {
  reconcileAmount: '',
  target: '',
  matchingTransactions: [],
};

export const AutoReconcileProvider = ({ children }) => {
  const [reconcileAmount, setReconcileAmount] = useState(initialState.reconcileAmount);
  const [target, setTarget] = useState(initialState.target);
  const [matchingTransactions, setMatchingTransactions] = useState(
    initialState.matchingTransactions
  );

  const resetState = () => {
    setReconcileAmount(initialState.reconcileAmount);
    setTarget(initialState.target);
    setMatchingTransactions(initialState.matchingTransactions);
  };

  const store = {
    reconcileAmount: [reconcileAmount, setReconcileAmount],
    target: [target, setTarget],
    matchingTransactions: [matchingTransactions, setMatchingTransactions],
    resetState,
  };

  return <AutoReconcileContext.Provider value={store}>{children}</AutoReconcileContext.Provider>;
};
