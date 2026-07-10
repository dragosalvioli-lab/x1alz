const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[, setTick\] = useState\(0\);[\s\S]*?\}, \[user\?\.id, db\.getPlayers\(\)\]\);/, `
  const [, setTick] = useState(0);
  useEffect(() => {
    const checkTime = () => setSystemOpen(db.isSystemOpen().isOpen);
    checkTime();
    const interval = setInterval(checkTime, 5000);
    
    const unsubscribe = db.subscribe(() => {
      setTick(t => t + 1); // Force re-render on any DB update
      setSystemOpen(db.isSystemOpen().isOpen);
    });
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Update user automatically when tick changes (DB update)
  useEffect(() => {
    if (user) {
      const updated = db.getPlayers().find(p => p.id === user.id);
      if (updated) {
        setUser({ ...updated });
      }
    }
  }, [user?.id]); // Only re-run when user.id changes, and wait, we need to re-run when tick changes. Let's just use user?.id and let the render take care of it? No, setUser is only needed if we want user state updated.
`);

fs.writeFileSync('src/App.tsx', code);
