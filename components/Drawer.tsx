// ... (imports remain the same)

export const Drawer: React.FC<DrawerProps> = ({ signal, mode, onClose }) => {
  if (!signal) return null;

  const getProteinInfo = () => {
    const text = (signal.label + signal.description).toLowerCase();
    
    if (text.includes('beef') || text.includes('steak') || text.includes('cow')) 
      return { icon: 'fa-cow', label: 'Beef Analysis' };
    
    if (text.includes('fish') || text.includes('salmon') || text.includes('seafood')) 
      return { icon: 'fa-fish', label: 'Fish Analysis' };

    if (text.includes('poultry') || text.includes('chicken') || text.includes('turkey')) 
      return { icon: 'fa-kiwi-bird', label: 'Poultry Analysis' };

    if (text.includes('pork') || text.includes('pig') || text.includes('ham')) 
      return { icon: 'fa-piggy-bank', label: 'Pork Analysis' };
    
    return { icon: 'fa-magnifying-glass', label: 'Visual Analysis' };
  };

  const protein = getProteinInfo();
  const isCritical = signal.riskLevel === 'critical';

  return (
    // ... (rest of the Drawer UI remains the same as your original file)
    // It will now correctly use the restored icons for Poultry and Pork
  );
};
