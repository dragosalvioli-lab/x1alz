const fs = require('fs');

let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf-8');

// 1. handleLogin
code = code.replace(/const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?  \};\n\n  const handleRegister =/, `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginEmail || !loginPassword) {
      setError('Por favor, informe seu email e senha.');
      return;
    }

    const res = await db.login(loginEmail, loginPassword);
    if (res.success) {
      // Don't call onSuccess manually if we are listening to db changes
      // or we can call onSuccess(res.user)
      if (onSuccess && res.user) onSuccess(res.user);
    } else {
      setError(res.error || 'Dados de login incorretos.');
    }
  };

  const handleRegister =`);

// 2. handleRegister
code = code.replace(/const handleRegister = \(e: React\.FormEvent\) => \{[\s\S]*?  \};\n\n  return \(/, `const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regEmail || !regPassword || !regNick || !regGuild) {
      setError('Por favor, preencha todos os campos do cadastro.');
      return;
    }
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso para cadastrar-se.');
      return;
    }

    const res = await db.register(regEmail, regPassword, regNick, regGuild);
    if (res.success) {
      setSuccessMsg('Conta criada com sucesso! Um email de verificação foi enviado. Por favor, verifique sua caixa de entrada e spam.');
      setIsLogin(true);
      setLoginEmail(regEmail);
      setLoginPassword('');
      
      // Clear register state
      setRegEmail('');
      setRegPassword('');
      setRegNick('');
      setRegGuild('');
      setAcceptTerms(false);
    } else {
      setError(res.error || 'Erro ao efetuar cadastro.');
    }
  };

  return (`);

// 3. remove adminNick usages
code = code.replace(/const isAdminNick = [\s\S]*?;\n/, '');
code = code.replace(/const \[adminPassword, setAdminPassword\] = useState\(''\);\n/, '');

// 4. Remove old login form inputs
code = code.replace(/<form onSubmit=\{handleLogin\} className="space-y-4 text-left">[\s\S]*?<\/form>\n          \) : \(/, `<form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
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
              <GamerButton type="submit" variant="blue" className="w-full py-3.5 text-sm mt-2">
                <Swords className="w-4 h-4" /> Entrar na Arena
              </GamerButton>
              <p className="text-center text-xs text-neutral-500 mt-4">
                Não possui conta?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Cadastre-se aqui
                </button>
              </p>
            </form>
          ) : (`);

// 5. Replace state variables at the top
code = code.replace(/const \[loginNick, setLoginNick\] = useState\(''\);/, "const [loginEmail, setLoginEmail] = useState('');\n  const [loginPassword, setLoginPassword] = useState('');");
code = code.replace(/const \[regNick, setRegNick\] = useState\(''\);/, "const [regNick, setRegNick] = useState('');\n  const [regEmail, setRegEmail] = useState('');\n  const [regPassword, setRegPassword] = useState('');");


// 6. fix register inputs
code = code.replace(/<form onSubmit=\{handleRegister\} className="space-y-4 text-left">[\s\S]*?<\/form>\n          \)}/, `<form onSubmit={handleRegister} className="space-y-4 text-left">
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
                <label className="block text-neutral-400 text-xs font-mono uppercase tracking-wider mb-1.5">
                  Guilda do Personagem
                </label>
                <div className="relative mb-4">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4.5 h-4.5" />
                  <input
                    type="text"
                    value={regGuild}
                    onChange={(e) => setRegGuild(e.target.value)}
                    placeholder="Ex: OsGuerreiros"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-11 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-sans"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-800 text-amber-500 focus:ring-amber-500 bg-neutral-950"
                />
                <label htmlFor="terms" className="text-xxs text-neutral-400 leading-normal select-none">
                  Eu concordo com as regras de apostas, retenção de taxa administrativa de 5%, e me comprometo a enviar os ALZ para o personagem correspondente.
                </label>
              </div>
              <GamerButton type="submit" variant="gold" className="w-full py-3 text-xs mt-2">
                Criar Minha Arena
              </GamerButton>
              <p className="text-center text-xs text-neutral-500 mt-3">
                Já é cadastrado?{' '}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Acesse sua conta
                </button>
              </p>
            </form>
          )}`);

fs.writeFileSync('src/components/AuthScreen.tsx', code);
