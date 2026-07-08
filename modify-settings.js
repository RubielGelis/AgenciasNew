const fs = require('fs');

function main() {
    const file = 'c:/Proyectos/AgenciasNew/src/app/dashboard/settings/page.tsx';
    let code = fs.readFileSync(file, 'utf8');
    let original = code;

    // 1. Add to Tab type
    code = code.replace(/('aeropuertos';)/, "'aeropuertos' | 'tipos-tiquetes';");

    // 2. Add state
    if (!code.includes('ticketTypes')) {
        code = code.replace(
            /(const \[airports, setAirports\] = useState<any\[\]>\(\[\]\))/,
            "$1\n    const [ticketTypes, setTicketTypes] = useState<any[]>([])"
        );
    }

    // 3. Add to fetch Promise.all
    if (!code.includes("fetch('/api/config/ticket-types')")) {
        code = code.replace(
            /(fetch\('\/api\/config\/airports'\)\.then\(res => res\.json\(\)\))/,
            "$1,\n                fetch('/api/config/ticket-types').then(res => res.json())"
        );
    }

    // 4. Add to variables destructuring
    code = code.replace(
        /(resCities, resAirports\] = await Promise\.all\(\[)/,
        "resCities, resAirports, resTicketTypes] = await Promise.all(["
    );

    // 5. Add to set state
    if (!code.includes("setTicketTypes(")) {
        code = code.replace(
            /(setAirports\(Array\.isArray\(resAirports\) \? resAirports : \[\]\))/,
            "$1\n            setTicketTypes(Array.isArray(resTicketTypes) ? resTicketTypes : [])"
        );
    }

    // 6. Add to setFormData in handleOpenModal
    if (!code.includes("activeTab === 'tipos-tiquetes' ? { code: '', name: '', description: '', isActive: true } :")) {
        code = code.replace(
            /(activeTab === 'ciudades' \? \{ code: '', name: '', countriesId: '', statecode: '', iata: '' \} :)/,
            "$1\n                activeTab === 'tipos-tiquetes' ? { code: '', name: '', description: '', isActive: true } :"
        );
    }
    
    // 7. Add to render form modal content
    if (!code.includes("activeTab === 'tipos-tiquetes' ? (")) {
        code = code.replace(
            /(activeTab === 'aeropuertos' \? \([\s\S]*?<\/SearchSelect>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/>[\s\S]*?\) :)/,
            `$1 activeTab === 'tipos-tiquetes' ? (
                                          <>
                                              <Input label="Código" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. INTERNACIONAL" />
                                              <Input label="Nombre" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Tiquete Internacional" />
                                              <Input label="Descripción" value={formData.description || ''} onChange={(v: string) => setFormData({ ...formData, description: v })} placeholder="Descripción opcional" />
                                          </>
                                      ) :`
        );
    }
    
    // 8. Add to render Tabs
    if (!code.includes("id: 'tipos-tiquetes'")) {
        code = code.replace(
            /(\{ id: 'aeropuertos', label: 'Aeropuertos', icon: PlaneTakeoff \},)/,
            "$1\n        { id: 'tipos-tiquetes', label: 'Tipos Tiquete', icon: Tag },"
        );
    }

    // 9. Add endpoints in handleSubmit
    if (!code.includes("activeTab === 'tipos-tiquetes' ? '/api/config/ticket-types' :")) {
        code = code.replace(
            /(activeTab === 'aeropuertos' \? '\/api\/config\/airports' :)/,
            "$1\n                                                                        activeTab === 'tipos-tiquetes' ? '/api/config/ticket-types' :"
        );
    }
    
    // handleDelete
    // Need to only replace the SECOND occurrence of aeropuertos if the first one was already replaced above.
    // Or just replace all occurrences of `activeTab === 'aeropuertos' ? '/api/config/airports' :` that are followed by `'/api/config/implants'`
    code = code.replace(
        /(activeTab === 'aeropuertos' \? '\/api\/config\/airports' :[\s]*'\/api\/config\/implants')/g,
        "activeTab === 'aeropuertos' ? '/api/config/airports' :\n                                                                        activeTab === 'tipos-tiquetes' ? '/api/config/ticket-types' :\n                                                                                    '/api/config/implants'"
    );
    
    // data for table
    if (!code.includes("activeTab === 'tipos-tiquetes' ? ticketTypes.filter(item =>")) {
        code = code.replace(
            /(activeTab === 'aeropuertos' \? airports\.filter\(item =>)/,
            `activeTab === 'tipos-tiquetes' ? ticketTypes.filter(item => 
                                (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))
                            ) :
                            $1`
        );
    }

    // table columns 
    if (!code.includes("activeTab === 'tipos-tiquetes' ? (")) {
        code = code.replace(
            /(\{activeTab === 'aeropuertos' \? \([\s\S]*?<th className="px-6 py-4 text-left text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-900\/50">CÓDIGO<\/th>)/,
            `{activeTab === 'tipos-tiquetes' ? (
                                        <>
                                            <th className="px-6 py-4 text-left text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-900/50">CÓDIGO</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-900/50">NOMBRE</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-900/50">DESCRIPCIÓN</th>
                                        </>
                                    ) : $1`
        );
    }

    // table body rows
    if (!code.includes("activeTab === 'tipos-tiquetes' ? (") || true) { // Re-apply for body rows
        code = code.replace(
            /(\{activeTab === 'aeropuertos' \? \([\s\S]*?<td className="px-6 py-4 text-sm font-medium text-white">\{item\.code\}<\/td>)/,
            `{activeTab === 'tipos-tiquetes' ? (
                                                <>
                                                    <td className="px-6 py-4 text-sm font-medium text-white">{item.code}</td>
                                                    <td className="px-6 py-4 text-sm text-zinc-400">{item.name}</td>
                                                    <td className="px-6 py-4 text-sm text-zinc-400">{item.description}</td>
                                                </>
                                            ) : $1`
        );
    }

    if (code !== original) {
        fs.writeFileSync(file, code);
        console.log("Settings page updated");
    } else {
        console.log("No changes applied");
    }
}
main();
