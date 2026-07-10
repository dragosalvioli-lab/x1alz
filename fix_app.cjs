const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const useEffectRegex = /useEffect\(\(\) => \{\s*const checkTime = \(\) => \{\s*setSystemOpen\(db\.isSystemOpen\(\)\.isOpen\);\s*\};\s*checkTime\(\);\s*const interval = setInterval\(checkTime, 5000\);\s*return \(\) => clearInterval\(interval\);\s*\}, \[\]\);/;

const newUseEffect = `
  // Poll for time restrictions and subscribe to DB updates
  useEffect(() => {
    const checkTime = () => {
      setSystemOpen(db.isSystemOpen().isOpen);
    };
    checkTime();
    const interval = setInterval(checkTime, 5000);
    
    // Subscribe to transparent Firebase proxy updates
    const unsubscribe = db.subscribe(() => {
      handleRefreshUser();
      setSystemOpen(db.isSystemOpen().isOpen);
    });
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);
`;

code = code.replace(useEffectRegex, newUseEffect);

fs.writeFileSync('src/App.tsx', code);
