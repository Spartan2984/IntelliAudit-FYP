import React, { createContext, useState, useContext } from 'react';

const DatasetContext = createContext();

export function useDataset() {
  return useContext(DatasetContext);
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
