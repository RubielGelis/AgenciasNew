const fs = require('fs');
const file = 'c:/Proyectos/AgenciasNew/src/app/dashboard/settings/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Normalize line endings to just \n for reliable matching
code = code.replace(/\r\n/g, '\n');

function insertAfter(str, searchStr, insertStr) {
    const idx = str.indexOf(searchStr);
    if (idx === -1) {
        console.warn('Could not find: ' + searchStr.slice(0, 50));
        return str;
    }
    return str.slice(0, idx + searchStr.length) + insertStr + str.slice(idx + searchStr.length);
}

function replaceExact(str, searchStr, replaceStr) {
    const idx = str.indexOf(searchStr);
    if (idx === -1) {
        console.warn('Could not find: ' + searchStr.slice(0, 50));
        return str;
    }
    return str.slice(0, idx) + replaceStr + str.slice(idx + searchStr.length);
}

// 1. Tab type
code = replaceExact(
    code,
    `'equivalencias';`,
    `'equivalencias' | 'tarjetas-credito' | 'formas-pago' | 'paises' | 'ciudades' | 'aeropuertos' | 'tipos-tiquetes';`
);

// 2. State vars
if (!code.includes('creditCards')) {
    code = insertAfter(
        code,
        `const [equivalences, setEquivalences] = useState<any[]>([])\n`,
        `    const [creditCards, setCreditCards] = useState<any[]>([])\n    const [payments, setPayments] = useState<any[]>([])\n    const [countries, setCountries] = useState<any[]>([])\n    const [cities, setCities] = useState<any[]>([])\n    const [airports, setAirports] = useState<any[]>([])\n    const [ticketTypes, setTicketTypes] = useState<any[]>([])\n`
    );
}

// 3. fetchData Promises
if (!code.includes('api/config/credit-cards')) {
    code = insertAfter(
        code,
        `fetch('/api/config/masters').then(res => res.json())\n`,
        `              ,fetch('/api/config/credit-cards').then(res => res.json())\n              ,fetch('/api/config/payments').then(res => res.json())\n              ,fetch('/api/config/countries').then(res => res.json())\n              ,fetch('/api/config/cities').then(res => res.json())\n              ,fetch('/api/config/airports').then(res => res.json())\n              ,fetch('/api/config/ticket-types').then(res => res.json())\n`
    );
}

// 4. fetchData Destructuring
if (!code.includes('resCreditCards')) {
    code = replaceExact(
        code,
        `, resInterfaces, resMasters] = await Promise.all([`,
        `, resInterfaces, resMasters, resCreditCards, resPayments, resCountries, resCities, resAirports, resTicketTypes] = await Promise.all([`
    );
}

// 5. fetchData Setters
if (!code.includes('setCreditCards')) {
    code = insertAfter(
        code,
        `setMasterList(Array.isArray(resMasters) ? resMasters : [])\n`,
        `            setCreditCards(Array.isArray(resCreditCards) ? resCreditCards : [])\n            setPayments(Array.isArray(resPayments) ? resPayments : [])\n            setCountries(Array.isArray(resCountries) ? resCountries : [])\n            setCities(Array.isArray(resCities) ? resCities : [])\n            setAirports(Array.isArray(resAirports) ? resAirports : [])\n            setTicketTypes(Array.isArray(resTicketTypes) ? resTicketTypes : [])\n`
    );
}

// 6. handleOpenModal forms
if (!code.includes("activeTab === 'tarjetas-credito'")) {
    const search6 = `} else if (activeTab === 'equivalencias') {
                setFormData({ id_interfaces: '', id_master: '', cd_maestro: '', cd_codigo: '', cd_codigoInte: '' })
            } else {`;
    const replace6 = `} else if (activeTab === 'equivalencias') {
                setFormData({ id_interfaces: '', id_master: '', cd_maestro: '', cd_codigo: '', cd_codigoInte: '' })
            } else if (activeTab === 'tarjetas-credito') {
                setFormData({ code: '', name: '', type: 'CC', inactive: false })
            } else if (activeTab === 'formas-pago') {
                setFormData({ code: '', name: '', iscash: false, iscredit: false, inactive: false })
            } else if (activeTab === 'paises') {
                setFormData({ code: '', name: '', dane: '', region: '', prefix: '', curencyId: '' })
            } else if (activeTab === 'ciudades') {
                setFormData({ code: '', name: '', countriesId: '', statecode: '', iata: '' })
            } else if (activeTab === 'aeropuertos') {
                setFormData({ code: '', name: '', citiesId: '' })
            } else if (activeTab === 'tipos-tiquetes') {
                setFormData({ code: '', name: '', description: '', isActive: true })
            } else {`;
    code = replaceExact(code, search6, replace6);
}

// 7. handleSubmit endpoints & handleDelete
if (!code.includes("activeTab === 'tarjetas-credito' ? '/api/config/credit-cards' :")) {
    // we want to replace `activeTab === 'equivalencias' ? '/api/config/equivalences' :`
    // with it + our new masters. We can just replace it globally.
    code = code.split(`activeTab === 'equivalencias' ? '/api/config/equivalences' :`).join(
        `activeTab === 'equivalencias' ? '/api/config/equivalences' :\n                                                                        activeTab === 'tarjetas-credito' ? '/api/config/credit-cards' :\n                                                                            activeTab === 'formas-pago' ? '/api/config/payments' :\n                                                                                activeTab === 'paises' ? '/api/config/countries' :\n                                                                                    activeTab === 'ciudades' ? '/api/config/cities' :\n                                                                                        activeTab === 'aeropuertos' ? '/api/config/airports' :\n                                                                                            activeTab === 'tipos-tiquetes' ? '/api/config/ticket-types' :`
    );
}

// 9. Form inputs UI
if (!code.includes("activeTab === 'tarjetas-credito' ? (")) {
    const idx9 = code.indexOf(`                                          </>\n                                      ) : (\n                                          <>\n                                              <Input label="C`);
    if (idx9 !== -1) {
        const replace9 = `                                          </>
                                      ) : activeTab === 'tarjetas-credito' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. VISA" />
                                            <Input label="Nombre de la Tarjeta" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Visa" />
                                        </>
                                    ) : activeTab === 'formas-pago' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. EF" />
                                            <Input label="Nombre de Forma de Pago" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Efectivo" />
                                        </>
                                    ) : activeTab === 'paises' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. CO" />
                                            <Input label="Nombre del País" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Colombia" />
                                        </>
                                    ) : activeTab === 'ciudades' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG" />
                                            <Input label="Nombre de la Ciudad" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Bogotá" />
                                        </>
                                    ) : activeTab === 'aeropuertos' ? (
                                        <>
                                            <Input label="Código (Único)" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. BOG" />
                                            <Input label="Nombre del Aeropuerto" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. El Dorado" />
                                        </>
                                    ) : activeTab === 'tipos-tiquetes' ? (
                                        <>
                                            <Input label="Código" value={formData.code || ''} onChange={(v: string) => setFormData({ ...formData, code: v })} required placeholder="Ej. INTERNACIONAL" />
                                            <Input label="Nombre" value={formData.name || ''} onChange={(v: string) => setFormData({ ...formData, name: v })} required placeholder="Ej. Tiquete Internacional" />
                                            <Input label="Descripción" value={formData.description || ''} onChange={(v: string) => setFormData({ ...formData, description: v })} placeholder="Descripción opcional" />
                                        </>
`;
        code = code.slice(0, idx9) + replace9 + code.slice(idx9 + 82);
    } else {
        console.log("Could not find insertion point for modal UI");
    }
}

// 10. Table filtering logic
if (!code.includes("activeTab === 'tarjetas-credito' ? creditCards.filter(")) {
    // There are some tabs/spaces mismatch. Let's just do a RegExp split/join for the first part of it.
    code = code.split(`activeTab === 'equivalencias' ? equivalences.filter`).join(
        `activeTab === 'tarjetas-credito' ? creditCards.filter(item => (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))) :\n                            activeTab === 'formas-pago' ? payments.filter(item => (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))) :\n                            activeTab === 'paises' ? countries.filter(item => (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))) :\n                            activeTab === 'ciudades' ? cities.filter(item => (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))) :\n                            activeTab === 'aeropuertos' ? airports.filter(item => (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))) :\n                            activeTab === 'tipos-tiquetes' ? ticketTypes.filter(item => (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))) :\n                            activeTab === 'equivalencias' ? equivalences.filter`
    );
}

// 11. Table headers
if (!code.includes("activeTab === 'tarjetas-credito' ? (")) {
    const idx11 = code.indexOf(`                                          </>\n                                      ) : (\n                                          <>\n                                              <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">C`);
    if (idx11 !== -1) {
        const replace11 = `                                          </>
                                      ) : activeTab === 'tarjetas-credito' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'formas-pago' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'paises' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'ciudades' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'aeropuertos' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
                                    ) : activeTab === 'tipos-tiquetes' ? (
                                        <>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Código</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nombre</th>
                                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Acciones</th>
                                        </>
`;
        code = code.slice(0, idx11) + replace11 + code.slice(idx11 + 82);
    } else {
        console.log("Could not find insertion point for table headers");
    }
}

// 12. Table body row
if (!code.includes("activeTab === 'tarjetas-credito' ? (")) {
    const idx12 = code.indexOf(`                                                </>\n                                            ) : (\n                                                <>\n                                                    <td className="px-8 py-5 text-sm font-medium text-white">{item.code}</td>`);
    if (idx12 !== -1) {
        const replace12 = `                                                </>
                                            ) : activeTab === 'tarjetas-credito' ? (
                                                <>
                                                    <td className="px-8 py-5 text-sm font-medium text-white">{item.code}</td>
                                                    <td className="px-8 py-5 text-sm text-zinc-400">{item.name}</td>
                                                </>
                                            ) : activeTab === 'formas-pago' ? (
                                                <>
                                                    <td className="px-8 py-5 text-sm font-medium text-white">{item.code}</td>
                                                    <td className="px-8 py-5 text-sm text-zinc-400">{item.name}</td>
                                                </>
                                            ) : activeTab === 'paises' ? (
                                                <>
                                                    <td className="px-8 py-5 text-sm font-medium text-white">{item.code}</td>
                                                    <td className="px-8 py-5 text-sm text-zinc-400">{item.name}</td>
                                                </>
                                            ) : activeTab === 'ciudades' ? (
                                                <>
                                                    <td className="px-8 py-5 text-sm font-medium text-white">{item.code}</td>
                                                    <td className="px-8 py-5 text-sm text-zinc-400">{item.name}</td>
                                                </>
                                            ) : activeTab === 'aeropuertos' ? (
                                                <>
                                                    <td className="px-8 py-5 text-sm font-medium text-white">{item.code}</td>
                                                    <td className="px-8 py-5 text-sm text-zinc-400">{item.name}</td>
                                                </>
                                            ) : activeTab === 'tipos-tiquetes' ? (
                                                <>
                                                    <td className="px-8 py-5 text-sm font-medium text-white">{item.code}</td>
                                                    <td className="px-8 py-5 text-sm text-zinc-400">{item.name}</td>
                                                </>
`;
        code = code.slice(0, idx12) + replace12 + code.slice(idx12 + 104);
    } else {
        console.log("Could not find insertion point for table body");
    }
}

// 13. Tab buttons
if (!code.includes("id: 'tarjetas-credito'")) {
    code = code.split(`{ id: 'equivalencias', label: 'Equivalencias', icon: ArrowRightLeft },`).join(
        `{ id: 'equivalencias', label: 'Equivalencias', icon: ArrowRightLeft },\n        { id: 'tarjetas-credito', label: 'Tarjetas Crédito', icon: CreditCard },\n        { id: 'formas-pago', label: 'Formas de Pago', icon: Banknote },\n        { id: 'paises', label: 'Países', icon: Globe },\n        { id: 'ciudades', label: 'Ciudades', icon: MapPin },\n        { id: 'aeropuertos', label: 'Aeropuertos', icon: PlaneTakeoff },\n        { id: 'tipos-tiquetes', label: 'Tipos Tiquete', icon: Tag },`
    );
}

// 14. Placeholder
code = code.replace(
    /activeTab === 'equivalencias' \? 'Equivalencia' : 'Implant'\}\.\.\.\`\}/g,
    `activeTab === 'equivalencias' ? 'Equivalencia' : activeTab === 'tarjetas-credito' ? 'Tarjetas Crédito' : activeTab === 'formas-pago' ? 'Formas de Pago' : activeTab === 'paises' ? 'Países' : activeTab === 'ciudades' ? 'Ciudades' : activeTab === 'aeropuertos' ? 'Aeropuertos' : activeTab === 'tipos-tiquetes' ? 'Tipos de Tiquete' : 'Implants'}...\`}`
);

fs.writeFileSync(file, code);
console.log('Restored all deleted masters successfully.');
