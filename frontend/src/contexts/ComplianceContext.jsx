import React, { createContext, useContext, useReducer } from 'react';

const ComplianceContext = createContext();

const complianceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [action.payload, ...state.products],
        loading: false 
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p._id === action.payload._id ? action.payload : p
        )
      };
    case 'SET_SUMMARY':
      return {
        ...state,
        summary: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  products: [],
  loading: false,
  error: null,
  summary: null
};

export const ComplianceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(complianceReducer, initialState);

  const value = {
    state,
    dispatch
  };

  return (
    <ComplianceContext.Provider value={value}>
      {children}
    </ComplianceContext.Provider>
  );
};

export const useCompliance = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
};