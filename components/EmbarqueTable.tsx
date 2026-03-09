import { Embarque } from '@/types/embarque';
import { isoToDisplay } from '@/lib/date-formatter';

interface TableProps {
    datos: Embarque[];
    activeTableTab: 'resumen' | 'completo';
    onEdit: (reg: Embarque) => void;
    onPlan: (id: number) => void;
    onDelete: (id: number) => void;
    setActiveTableTab: (tab: 'resumen' | 'completo') => void;
}

export function EmbarqueTable({ datos, activeTableTab, onEdit, onPlan, onDelete, setActiveTableTab }: TableProps) {
    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Tabs de vista de tabla */}
            <div className="flex bg-slate-800/50 items-center justify-between border-b border-slate-700">
                <div className="flex">
                    {(['resumen', 'completo'] as const).map((tab) => (
                        <button
                            key={tab} type="button" onClick={() => setActiveTableTab(tab)}
                            className={`px-8 py-4 text-xs font-bold tracking-wider uppercase transition-all ${activeTableTab === tab ? 'bg-blue-600 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] text-slate-500 pr-4 uppercase tracking-widest">{datos.length} registros</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" style={{ whiteSpace: "nowrap" }}>
                    <thead className="bg-slate-800 text-slate-400 uppercase">
                        <tr>
                            {/* ── COLUMNAS COMUNES A AMBAS VISTAS ── */}
                            <th className="p-4">Semana</th>
                            <th className="p-4">Booking / Nave</th>
                            <th className="p-4">Naviera</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Destino Puerto</th>
                            <th className="p-4">Depot</th>
                            <th className="p-4">Terminal</th>
                            <th className="p-4 text-center">#Contenedores</th>
                            <th className="p-4 text-center">Cajas Totales</th>
                            <th className="p-4">Marca</th>
                            <th className="p-4">Tipo Caja</th>
                            <th className="p-4 text-center">Peso Neto</th>
                            <th className="p-4 text-center">Peso Bruto</th>
                            <th className="p-4">Orden</th>
                            <th className="p-4">AUCP</th>
                            <th className="p-4">DAE</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Cut Off Físico</th>
                            <th className="p-4">Cut Off Docs</th>
                            <th className="p-4 text-center">Energía (Hrs.)</th>
                            <th className="p-4">Días Detention</th>
                            <th className="p-4">Días Almacenaje</th>
                            <th className="p-4">Agencia Export.</th>
                            <th className="p-4">Observaciones</th>
                            {/* ── COLUMNAS EXCLUSIVAS DE COMPLETO ── */}
                            {activeTableTab === 'completo' && (<>
                                <th className="p-4">País Destino</th>
                                <th className="p-4">Ciudad Destino</th>
                                <th className="p-4">Destino Final</th>
                                <th className="p-4">Tipo Embarque</th>
                                <th className="p-4 text-center">Cajas x Cont.</th>
                                <th className="p-4 text-center"># Pallets</th>
                                <th className="p-4 text-center">Cajas x Pallet</th>
                                <th className="p-4 text-center">Cjs. Tot. Pallet</th>
                                <th className="p-4 text-center">Cjs. Tot. Granel</th>
                                <th className="p-4">Calidad</th>
                                <th className="p-4">Molécula</th>
                                <th className="p-4">Pad</th>
                                <th className="p-4">Funda</th>
                                <th className="p-4">Sachet</th>
                                <th className="p-4 text-center">P. Neto x Caja</th>
                                <th className="p-4 text-center">P. Bruto x Caja</th>
                                <th className="p-4">Inicio Energ. Libre</th>
                                <th className="p-4">ETD</th>
                                <th className="p-4">TTE</th>
                                <th className="p-4">ETA</th>
                                <th className="p-4">Factura</th>
                                <th className="p-4">BL</th>
                                <th className="p-4">Liberación</th>
                                <th className="p-4">Negociación</th>
                                <th className="p-4">Térm. Pago</th>
                                <th className="p-4">Incoterm</th>
                                <th className="p-4">Banco</th>
                                <th className="p-4">Docs. Enviados</th>
                                <th className="p-4">Área/Depto.</th>
                                <th className="p-4 text-center">Precio x Caja</th>
                                <th className="p-4 text-center">Incoterm Facturado</th>
                            </>)}
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {datos.map((reg) => (
                            <tr key={reg.id_embarque} className="hover:bg-slate-800/40 transition-colors">
                                {/* ── CELDAS COMUNES ── */}
                                <td className="p-4 font-bold text-blue-400">{reg.semana}</td>
                                <td className="p-4">
                                    <div className="font-medium text-slate-200">{reg.booking}</div>
                                    <div className="text-[10px] text-slate-500">{reg.vessel} {reg.voyager}</div>
                                </td>
                                <td className="p-4 font-medium">{reg.naviera}</td>
                                <td className="p-4 font-medium">{reg.cliente}</td>
                                <td className="p-4 font-medium">{reg.puerto_destino_de_descarga}</td>
                                <td className="p-4 font-medium">{reg.depot_de_retiro}</td>
                                <td className="p-4 font-medium">{reg.almacen_terminal_portuario}</td>
                                <td className="p-4 text-center font-medium">{reg.cant_contenedores}</td>
                                <td className="p-4 text-center font-medium">{reg.cajas_totales_cont}</td>
                                <td className="p-4 font-medium">{reg.marca}</td>
                                <td className="p-4 font-medium">{reg.tipo_de_caja}</td>
                                <td className="p-4 text-center font-medium">{reg.pneto_total}</td>
                                <td className="p-4 text-center font-medium">{reg.pbruto_total}</td>
                                <td className="p-4 font-medium">{reg.orden}</td>
                                <td className="p-4 font-medium">{reg.aucp}</td>
                                <td className="p-4 font-medium">{reg.dae}</td>
                                <td className="p-4 font-medium">{reg.regularizado}</td>
                                <td className="p-4 font-medium">{isoToDisplay(reg.cut_off_fisico)}</td>
                                <td className="p-4 font-medium">{isoToDisplay(reg.cut_off_docs)}</td>
                                <td className="p-4 text-center font-medium">{reg.horas_energia_libre}</td>
                                <td className="p-4 font-medium">{reg.detencion_libre}</td>
                                <td className="p-4 font-medium">{reg.almacenaje_libre}</td>
                                <td className="p-4 font-medium">{reg.agencia_exportadora}</td>
                                <td className="p-4 font-medium">{reg.observaciones}</td>
                                {/* ── CELDAS EXCLUSIVAS DE COMPLETO ── */}
                                {activeTableTab === 'completo' && (<>
                                    <td className="p-4 font-medium">{reg.pais_destino}</td>
                                    <td className="p-4 font-medium">{reg.ciudad_destino}</td>
                                    <td className="p-4 font-medium">{reg.destino_final_de_la_carga}</td>
                                    <td className="p-4 font-medium">{reg.tipo_de_embarque}</td>
                                    <td className="p-4 text-center font-medium">{reg.cajas_x_cont}</td>
                                    <td className="p-4 text-center font-medium">{reg.cant_pallets}</td>
                                    <td className="p-4 text-center font-medium">{reg.cajas_x_pallet}</td>
                                    <td className="p-4 text-center font-medium">{reg.cajas_totales_pallet}</td>
                                    <td className="p-4 text-center font-medium">{reg.cajas_totales_granel}</td>
                                    <td className="p-4 font-medium">{reg.calidad}</td>
                                    <td className="p-4 font-medium">{reg.molecula}</td>
                                    <td className="p-4 font-medium">{reg.pad}</td>
                                    <td className="p-4 font-medium">{reg.funda}</td>
                                    <td className="p-4 font-medium">{reg.sachet}</td>
                                    <td className="p-4 text-center font-medium">{reg.pneto_x_caja}</td>
                                    <td className="p-4 text-center font-medium">{reg.pbruto_x_caja}</td>
                                    <td className="p-4 font-medium">{reg.inicio_energia_libre}</td>
                                    <td className="p-4 font-medium">{reg.etd}</td>
                                    <td className="p-4 font-medium">{reg.tte}</td>
                                    <td className="p-4 font-medium">{reg.eta}</td>
                                    <td className="p-4 font-medium">{reg.factura}</td>
                                    <td className="p-4 font-medium">{reg.bl}</td>
                                    <td className="p-4 font-medium">{reg.liberacion}</td>
                                    <td className="p-4 font-medium">{reg.negociacion}</td>
                                    <td className="p-4 font-medium">{reg.terminos_de_pago}</td>
                                    <td className="p-4 font-medium">{reg.incoterm}</td>
                                    <td className="p-4 font-medium">{reg.banco}</td>
                                    <td className="p-4 font-medium">{isoToDisplay(reg.documentos_enviados)}</td>
                                    <td className="p-4 font-medium">{reg.area_departamento}</td>
                                    <td className="p-4 text-center font-medium">{reg.precio_x_caja}</td>
                                    <td className="p-4 text-center font-medium">{reg.incoterm_facturado}</td>
                                </>)}
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-3">
                                        {/* Cambia prepararEdicion por onEdit */}
                                        <button onClick={() => onEdit(reg)} className="text-blue-400 hover:text-blue-300">Editar</button>

                                        {/* Cambia planificarEmbarque por onPlan */}
                                        <button onClick={() => onPlan(reg.id_embarque)} className="text-green-500 hover:text-green-400 font-bold">Planificar</button>

                                        {/* Cambia eliminarEmbarque por onDelete */}
                                        <button onClick={() => onDelete(reg.id_embarque)} className="text-red-500 hover:text-red-400 font-bold">Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}