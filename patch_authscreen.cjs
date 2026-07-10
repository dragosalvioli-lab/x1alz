const fs = require('fs');
let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf-8');

code = code.replace(/const \[loginNick, setLoginNick\] = useState\(''\);/, "const [loginEmail, setLoginEmail] = useState('');\n  const [loginPassword, setLoginPassword] = useState('');");
code = code.replace(/const \[adminPassword, setAdminPassword\] = useState\(''\);\n  const \[isAdminNick, setIsAdminNick\] = useState\(false\);/, "");
code = code.replace(/const \[regNick, setRegNick\] = useState\(''\);/, "const [regNick, setRegNick] = useState('');\n  const [regEmail, setRegEmail] = useState('');\n  const [regPassword, setRegPassword] = useState('');");

code = code.replace(/useEffect\(\(\) => \{\n    setIsAdminNick\(loginNick\.toLowerCase\(\) === 'x1alzadmin' || loginNick\.toLowerCase\(\) === 'admin@x1alz\.com'\);\n  \}, \[loginNick\]\);/, "");

code = code.replace(/const handleLogin = \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    setError\(''\);\n    setSuccessMsg\(''\);\n    if \(!loginNick\.trim\(\)\) \{\n      setError\('Por favor, informe seu nick\.'\);\n      return;\n    \}\n    const res = db\.login\(loginNick, isAdminNick \? adminPassword : undefined\);\n    if \(res\.success\) \{\n      onLoginSuccess\(\);\n    \} else \{\n      setError\(res\.error \|\| 'Erro ao fazer login'\);\n    \}\n  \};/, `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Por favor, preencha email e senha.');
      return;
    }
    const res = await db.login(loginEmail, loginPassword);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Erro ao fazer login');
    }
  };`);

code = code.replace(/const handleRegister = \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    setError\(''\);\n    setSuccessMsg\(''\);\n    if \(!regNick\.trim\(\) \|\| !regGuild\.trim\(\)\) \{\n      setError\('Por favor, preencha todos os campos\.'\);\n      return;\n    \}\n    if \(!acceptTerms\) \{\n      setError\('Você deve aceitar os termos da arena\.'\);\n      return;\n    \}\n    const res = db\.register\(regNick, regGuild\);\n    if \(res\.success\) \{\n      setSuccessMsg\('Conta criada com sucesso! Faça login\.'\);\n      setIsLogin\(true\);\n      setLoginNick\(regNick\);\n      setRegNick\(''\);\n      setRegGuild\(''\);\n    \} else \{\n      setError\(res\.error \|\| 'Erro ao registrar'\);\n    \}\n  \};/, `const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!regEmail.trim() || !regPassword.trim() || !regNick.trim() || !regGuild.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (!acceptTerms) {
      setError('Você deve aceitar os termos da arena.');
      return;
    }
    const res = await db.register(regEmail, regPassword, regNick, regGuild);
    if (res.success) {
      setSuccessMsg('Conta criada com sucesso! Um email de verificação foi enviado. Por favor, verifique sua caixa de entrada e spam.');
      setIsLogin(true);
      setLoginEmail(regEmail);
      setRegEmail('');
      setRegPassword('');
      setRegNick('');
      setRegGuild('');
    } else {
      setError(res.error || 'Erro ao registrar');
    }
  };`);

code = code.replace(/<label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1\.5">\s*Nome do Personagem \(Nick\)\s*<\/label>\s*<div className="relative">\s*<UserIcon className="absolute left-3\.5 top-1\/2 -translate-y-1\/2 text-neutral-500 w-4\.5 h-4\.5" \/>\s*<input\s*type="text"\s*value=\{loginNick\}\s*onChange=\{\(e\) => setLoginNick\(e\.target\.value\)\}\s*placeholder="Ex: GuerreiroPVP"\s*className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-colors font-sans"\s*\/>\s*<\/div>\s*<\/div>\s*\{isAdminNick && \([\s\S]*?\}\)/, `
              <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative mb-4">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                  />
                </div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                  />
                </div>
              </div>
`);

code = code.replace(/<form onSubmit=\{handleRegister\} className="space-y-4 text-left">\s*<div>\s*<label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1\.5">\s*Nome do Personagem \(Nick\)\s*<\/label>\s*<div className="relative">\s*<UserIcon className="absolute left-3\.5 top-1\/2 -translate-y-1\/2 text-neutral-500 w-4\.5 h-4\.5" \/>\s*<input\s*type="text"\s*value=\{regNick\}\s*onChange=\{\(e\) => setRegNick\(e\.target\.value\)\}\s*placeholder="Ex: GuerreiroPVP"\s*className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"\s*\/>\s*<\/div>\s*<\/div>/, `<form onSubmit={handleRegister} className="space-y-4 text-left">
              <div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative mb-4">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <div className="relative mb-4">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Nome do Personagem (Nick)
                </label>
                <div className="relative mb-4">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="text"
                    value={regNick}
                    onChange={(e) => setRegNick(e.target.value)}
                    placeholder="Ex: GuerreiroPVP"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
              </div>`);

fs.writeFileSync('src/components/AuthScreen.tsx', code);
