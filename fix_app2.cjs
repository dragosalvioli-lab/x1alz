const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, `
  // Subscribe to DB
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
      const players = db.getPlayers();
      const updated = players.find(p => p.id === user.id);
      if (updated) {
        setUser({ ...updated });
      }
    }
  }, [user?.id, db.getPlayers()]);
`);

fs.writeFileSync('src/App.tsx', code);
