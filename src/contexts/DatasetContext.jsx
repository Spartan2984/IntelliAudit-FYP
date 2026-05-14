import React, { createContext, useState, useContext } from 'react';

const DatasetContext = createContext();

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}

export function DatasetProvider({ children }) {
  const [dataset, setDataset] = useState(null); // { headers: [], rows: [] }
  const [metadata, setMetadata] = useState(null); // { filename: '', totalRows: 0, totalColumns: 0, fileSize: '' }
  const [loading, setLoading] = useState(false);

  const clearDataset = () => {
    setDataset(null);
    setMetadata(null);
  };

  const value = {
    dataset,
    setDataset,
    metadata,
    setMetadata,
    loading,
    setLoading,
    clearDataset,
  };

  return (
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  );
}
