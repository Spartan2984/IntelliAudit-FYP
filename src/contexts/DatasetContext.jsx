import React, { createContext, useContext, useState } from 'react';

const DatasetContext = createContext();

export const DatasetProvider = ({ children }) => {
  const [dataset, setDataset] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        setDataset,
        metadata,
        setMetadata,
        loading,
        setLoading,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};
