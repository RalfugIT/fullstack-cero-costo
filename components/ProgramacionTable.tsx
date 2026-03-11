import { Contenedor, Corte } from '@/types/programacion';

interface ProgramacionRow extends Corte {
    contenedores: Contenedor;
}

interface Props {
    datos: ProgramacionRow[];
}

export function ProgramacionTable({ datos }: Props) {
    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden mt-10">
            <div className="flex bg-slate-800/50 items-center justify-between border-b border-slate-700">
                <div className="flex">
                    <button className="px-8 py-4 text-xs font-bold tracking-wider uppercase bg-blue-600 text-white shadow-inner">
                        Resumen de Programación
                    </button>
                </div>
                <span className="text-[10px] text-slate-500 pr-4 uppercase tracking-widest">{datos.length} cortes planificados</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ whiteSpace: "nowrap" }}>
                    <thead className="bg-slate-800 text-slate-400 uppercase">
                        <tr>
                            <th className="p-4">Contenedor</th>
                            <th className="p-4">Productor</th>
                            <th className="p-4">Hacienda</th>
                            <th className="p-4 text-center">Cajas Prog.</th>
                            <th className="p-4">Sello Naviero</th>
                            <th className="p-4">Sello Exp.</th>
                            <th className="p-4">Termógrafo</th>
                            <th className="p-4">Día de Corte</th>
                            <th className="p-4">Zona</th>
                            <th className="p-4">Marca</th>
                            <th className="p-4">Modalidad</th>
                            <th className="p-4">Consolidación</th>
                            <th className="p-4">Código Productor</th>
                            <th className="p-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {datos.map((row) => (
                            <tr key={row.id_corte} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-4 font-bold text-blue-400">{row.contenedores.contenedor}</td>
                                <td className="p-4 font-medium text-slate-200">{row.productor}</td>
                                <td className="p-4 font-medium text-slate-400">{row.hacienda}</td>
                                <td className="p-4 text-center font-bold text-emerald-400">{row.cajas_programadas}</td>
                                <td className="p-4 font-medium text-slate-400">{row.contenedores.sello_naviero}</td>
                                <td className="p-4 font-medium text-slate-400">{row.contenedores.sello_exportador}</td>
                                <td className="p-4 font-medium text-slate-400">{row.contenedores.termografo}</td>
                                <td className="p-4 font-medium text-slate-400">{row.dia_de_corte}</td>
                                <td className="p-4 font-medium text-slate-400">{row.zona}</td>
                                <td className="p-4 font-medium text-slate-400">{row.marca}</td>
                                <td className="p-4 font-medium text-slate-400">{row.modalidad}</td>
                                <td className="p-4 font-medium text-slate-400">{row.consolidacion}</td>
                                <td className="p-4 font-medium text-slate-400">{row.codigo_productor}</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button className="text-blue-400 hover:text-blue-300">Ver</button>
                                        <button className="text-red-500 hover:text-red-400 font-bold">Borrar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {datos.length === 0 && (
                            <tr>
                                <td colSpan={14} className="p-10 text-center text-slate-500 italic">
                                    No hay programaciones registradas para este embarque.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
