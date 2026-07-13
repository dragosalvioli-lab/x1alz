const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const regexTabs = /\{\[\s*\{\s*id:\s*'rooms',\s*label:\s*'Gerenciar Salas',\s*icon:\s*Sliders\s*\},[\s\S]*?\]\.map/;
code = code.replace(regexTabs, `{[
            { id: 'rooms', label: 'Gerenciar Salas', icon: Sliders },
            { id: 'payments', label: 'Pagamentos Fila', icon: CheckCircle },
            { id: 'tickets', label: 'Suporte (Tickets)', icon: HeartHandshake },
            { id: 'reports', label: 'Relatórios Financeiros', icon: FileText },
            { id: 'settings', label: 'Configurações', icon: SettingsIcon },
          ].map`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
