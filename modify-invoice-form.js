const fs = require('fs');

function main() {
    const file = 'c:/Proyectos/AgenciasNew/src/app/dashboard/invoices/new/invoice-form.tsx';
    let code = fs.readFileSync(file, 'utf8');

    const insertAfter = `                                                <div className="md:col-span-3 space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-blue-500">Descripción Manual</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Descripción de lo que se está cobrando..."
                                                        className="w-full h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 border border-blue-200 dark:border-blue-800 outline-none text-xs"
                                                        value={item.descripcion || ''}
                                                        onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                                                    />
                                                </div>
                                            </div>`;

    const extraFieldsRow = `

                                            {item.serviceType === 'Tiquete' && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-bold text-blue-500">Itinerario de Vuelo</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ej: BOG/CTG"
                                                            className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs uppercase"
                                                            value={item.itinerary || ''}
                                                            onChange={(e) => updateItem(index, 'itinerary', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-bold text-blue-500">Itinerario de Clases</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ej: C/C"
                                                            className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs uppercase"
                                                            value={item.class || ''}
                                                            onChange={(e) => updateItem(index, 'class', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase font-bold text-blue-500">Itinerario de Aerolínea</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Ej: AV/AV"
                                                            className="w-full h-9 bg-white dark:bg-zinc-900 rounded-lg px-2 border border-zinc-200 dark:border-zinc-800 outline-none text-xs uppercase"
                                                            value={item.airline || ''}
                                                            onChange={(e) => updateItem(index, 'airline', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}`;

    if (!code.includes("itinerary || ''") && code.includes(insertAfter)) {
        code = code.replace(insertAfter, insertAfter + extraFieldsRow);
        fs.writeFileSync(file, code);
        console.log("Invoice form updated");
    } else {
        console.log("Could not update invoice form - already updated or target text not found.");
    }
}
main();
