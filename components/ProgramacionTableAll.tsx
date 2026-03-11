interface Props {
    datos: any[];
    onDelete: (id: number) => void;
    onEdit: (corte: any) => void;
}

export function ProgramacionTableAll({ datos, onDelete, onEdit }: Props) {
    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="flex bg-slate-800/50 items-center justify-between border-b border-slate-700">
                <div className="flex">
                    <button className="px-8 py-4 text-xs font-bold tracking-wider uppercase bg-emerald-600 text-white shadow-inner">
                        Listado de Cortes Planificados
                    </button>
                </div>
                <span className="text-[10px] text-slate-500 pr-4 uppercase tracking-widest">{datos.length} registros</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ whiteSpace: "nowrap" }}>
                    <thead className="bg-slate-800 text-slate-400 uppercase">
                        <tr>
                            <th className="p-3">Booking</th>
                            <th className="p-3">Contenedor</th>
                            <th className="p-3">Productor</th>
                            <th className="p-3">Hacienda</th>
                            <th className="p-3 text-center">Cajas</th>
                            <th className="p-3">Zona</th>
                            <th className="p-3">Marca</th>
                            <th className="p-3">Día Corte</th>
                            <th className="p-3">Modalidad</th>
                            <th className="p-3">Sello Naviero</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {datos.map((row) => (
                            <tr key={row.id_corte} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-bold text-blue-400">{row.contenedores?.embarques?.booking || 'N/A'}</td>
                                <td className="p-3 font-bold text-emerald-400">{row.contenedores?.contenedor || 'N/A'}</td>
                                <td className="p-3 font-medium text-slate-200">{row.productor || '-'}</td>
                                <td className="p-3 font-medium text-slate-400">{row.hacienda || '-'}</td>
                                <td className="p-3 text-center font-bold text-yellow-400">{row.cajas_programadas || 0}</td>
                                <td className="p-3 font-medium text-slate-400">{row.zona || '-'}</td>
                                <td className="p-3 font-medium text-slate-400">{row.marca || '-'}</td>
                                <td className="p-3 font-medium text-slate-400">{row.dia_de_corte || '-'}</td>
                                <td className="p-3 font-medium text-slate-400">{row.modalidad || '-'}</td>
                                <td className="p-3 font-medium text-slate-400">{row.contenedores?.sello_naviero || '-'}</td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => onEdit(row)}
                                            className="text-blue-400 hover:text-blue-300 font-bold"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => onDelete(row.id_corte)}
                                            className="text-red-500 hover:text-red-400 font-bold"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {datos.length === 0 && (
                            <tr>
                                <td colSpan={11} className="p-10 text-center text-slate-500 italic">
                                    No hay cortes planificados aún.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
