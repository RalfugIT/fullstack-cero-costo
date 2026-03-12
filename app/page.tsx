'use client'

import { isoToDisplay, displayToIso, dateToDisplay } from '@/lib/date-formatter';
import { ChangeEvent, useEffect, useState, FormEvent } from 'react';
import { MenuItem, Embarque, EmbarqueForm } from '@/types/embarque';
import { Field, SelectField } from '@/components/FormFields';
import { useEmbarques } from '@/hooks/useEmbarques';
import { EmbarqueTable } from '@/components/EmbarqueTable';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useProgramacion } from '@/hooks/useProgramacion';
import { Contenedor, Corte } from '@/types/programacion';
import { ProgramacionTable } from '@/components/ProgramacionTable';
import { ProgramacionTableAll } from '@/components/ProgramacionTableAll';

// --- ICONOS SVG PARA EL SIDEBAR ---
const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  ),
  Ship: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.26 1.15 4.3 3 5.37" /><path d="M12 4v6" /><path d="M10 2h4" /></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
  ),
  Truck: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-5h-4l-3 5" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
  ),
  Leaf: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
  ),
  Box: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
  ),
  Coins: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></svg>
  )
};

// Definición de los items del menú con íconos representativos
const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'Home Dashboard', icon: <Icons.Home /> },
  { id: 'embarques', label: 'Embarques', icon: <Icons.Ship /> },
  { id: 'programacion', label: 'Programación', icon: <Icons.Calendar /> },
  { id: 'logistica', label: 'Logística', icon: <Icons.Truck /> },
  { id: 'terminados', label: 'Tarjas // AISV', icon: <Icons.FileText /> },
  { id: 'agrocalidad', label: 'Agrocalidad', icon: <Icons.Leaf /> },
  { id: 'inventario', label: 'Cupos // Inventario', icon: <Icons.Box /> },
  { id: 'costos', label: 'Costos Operativos', icon: <Icons.Coins /> },
];

// --- COMPONENTE PRINCIPAL ---
export default function DashboardPage() {
  // --- USAMOS EL HOOK ---
  // Traemos los datos y las funciones de acción directamente
  const { datos, loading, guardarEmbarque, eliminarEmbarque, planificarEmbarque } = useEmbarques();

  // --- ESTADOS DE PROGRAMACIÓN ---
  const [selectedEmbarqueId, setSelectedEmbarqueId] = useState<number | null>(null);
  const [editandoCorteId, setEditandoCorteId] = useState<number | null>(null);
  const { contenedores, programacionCompleta, todosLosCortes, loading: loadingProg, guardarPlanificacion, eliminarCorte: eliminarCorteDB } = useProgramacion(selectedEmbarqueId);

  const initialCorteState: Partial<Corte> = {
    negocia_productor: '', comercial: '', grupo: '', dia_de_corte: '', zona: '', productor: '',
    hacienda: '', ubicacion: '', marca: '', cajas_programadas: 0, carton_desde: '',
    consolidacion: '', modalidad: '', codigo_productor: '', codigo_magap: ''
  };

  const initialContenedorState: Partial<Contenedor> = {
    contenedor: '', sello_naviero: '', sello_exportador: '', termografo: '',
    tara: 0, peso_vgm: 0, peso_neto_ct: 0
  };

  const [formProg, setFormProg] = useState({
    contenedor: initialContenedorState,
    cortes: [initialCorteState]
  });

  // --- ESTADOS DE UI (Se mantienen en la página) ---
  const [activeModule, setActiveModule] = useState('embarques');
  const [activeTab, setActiveTab] = useState('Comex');
  const [collapsed, setCollapsed] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [subtipoSuelta, setSubtipoSuelta] = useState('');
  const [activeTableTab, setActiveTableTab] = useState<'resumen' | 'completo'>('resumen');
  const isGlobalLoading = loading || loadingProg;

  const initialFormState: EmbarqueForm = {
    semana: '',
    booking: '',
    vessel: '',
    voyager: '',
    naviera: '',
    cliente: '',
    pais_destino: '',
    ciudad_destino: '',
    puerto_destino_de_descarga: '',
    destino_final_de_la_carga: '',
    depot_de_retiro: '',
    almacen_terminal_portuario: '',
    tipo_de_embarque: '',
    cant_contenedores: 0,
    cajas_x_cont: 0,
    cajas_totales_cont: 0,
    cant_pallets: 0,
    cajas_x_pallet: 0,
    cajas_totales_pallet: 0,
    cajas_totales_granel: 0,
    marca: '',
    tipo_de_caja: '',
    calidad: '',
    pad: '',
    funda: '',
    sachet: '',
    molecula: '',
    pneto_x_caja: 0,
    pneto_total: 0,
    pbruto_x_caja: 0,
    pbruto_total: 0,
    horas_energia_libre: 0,
    inicio_energia_libre: '',
    cut_off_fisico: '',
    cut_off_docs: '',
    detencion_libre: '',
    almacenaje_libre: '',
    agencia_exportadora: '',
    observaciones: '',
    orden: '',
    aucp: '',
    dae: '',
    regularizado: '',
    etd: '',
    tte: '',
    eta: '',
    precio_x_caja: 0,
    factura: '',
    bl: '',
    liberacion: '',
    negociacion: '',
    terminos_de_pago: '',
    incoterm: '',
    banco: '',
    documentos_enviados: '',
    area_departamento: '',
    incoterm_facturado: 0
  };

  const [form, setForm] = useState<EmbarqueForm>(initialFormState);

  // LÓGICA DE CÁLCULOS ---
  const calculos = {
    cjs_totales_cont: Number(form.cant_contenedores) * Number(form.cajas_x_cont),
    cjs_totales_pallet: Number(form.cant_pallets) * Number(form.cajas_x_pallet),
    get total_general() {
      if (form.tipo_de_embarque === 'CARGA CONTENERIZADA') return this.cjs_totales_cont;
      if (form.tipo_de_embarque === 'CARGA SUELTA' && subtipoSuelta === 'PALETIZADA') return this.cjs_totales_pallet;
      if (form.tipo_de_embarque === 'CARGA SUELTA' && subtipoSuelta === 'AL GRANEL') return Number(form.cajas_totales_granel);
      return 0;
    },
    get p_neto_total() { return this.total_general * Number(form.pneto_x_caja); },
    get p_bruto_total() { return this.total_general * Number(form.pbruto_x_caja); },
    get incoterm_facturado() { return this.total_general * Number(form.precio_x_caja); },
    // inicio_energia_libre = cut_off_fisico - horas_energia_libre (horas)
    get inicio_energia_libre_calc(): string {
      if (!form.cut_off_fisico) return '';
      const date = new Date(form.cut_off_fisico); // ISO format stored internally
      if (isNaN(date.getTime())) return '';
      date.setHours(date.getHours() - Number(form.horas_energia_libre));
      return dateToDisplay(date);
    }
  };

  // --- TODOS LOS HANDLERS ---

  // FUNCIÓN: MANEJAR INPUT ---
  const INTEGER_FIELDS = ['cant_contenedores', 'cajas_x_cont', 'cant_pallets', 'cajas_x_pallet', 'cajas_totales_granel'];
  const DECIMAL_FIELDS = ['pneto_x_caja', 'pbruto_x_caja', 'precio_x_caja'];
  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;
    if (type === 'number') {
      if (INTEGER_FIELDS.includes(name)) parsedValue = parseInt(value, 10) || 0;
      else if (DECIMAL_FIELDS.includes(name)) parsedValue = parseFloat(value) || 0;
      else parsedValue = Number(value);
    }
    setForm({ ...form, [name]: parsedValue });
  };

  // --- MANEJADORES ACTUALIZADOS ---

  // Preparar edición: Ahora solo maneja el estado visual
  const prepararEdicion = (reg: Embarque) => {
    setForm({
      ...reg,
      cut_off_fisico: displayToIso(reg.cut_off_fisico),
      cut_off_docs: displayToIso(reg.cut_off_docs),
    } as Embarque);
    setEditandoId(reg.id_embarque);
    setCollapsed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guardar: Llama a la función del Hook
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Preparamos el payload como antes
    const datosParaGuardar = {
      ...form,
      // Fechas de tipo timestamp: guardar en ISO (YYYY-MM-DDTHH:MM) para que Postgres las interprete correctamente.
      // NO usar isoToDisplay aquí — Postgres en DateStyle MDY interpreta DD/MM como MM/DD, invirtiendo mes y día.
      cut_off_fisico: form.cut_off_fisico || null,
      cut_off_docs: form.cut_off_docs || null,
      // inicio_energia_libre es calculado y se muestra como texto, guardar en display format
      inicio_energia_libre: calculos.inicio_energia_libre_calc,
      cajas_totales_cont: calculos.cjs_totales_cont,
      cajas_totales_pallet: calculos.cjs_totales_pallet,
      pneto_total: calculos.p_neto_total,
      pbruto_total: calculos.p_bruto_total,
      incoterm_facturado: form.incoterm_facturado || calculos.incoterm_facturado
    };

    // Corrección del error de Timestamp: Convertimos "" a null
    const payload = Object.fromEntries(
      Object.entries(datosParaGuardar).map(([key, value]) => [key, value === "" ? null : value])
    );

    // Llamada al Hook
    const { error } = await guardarEmbarque(payload, editandoId);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(editandoId ? "Actualizado correctamente" : "Registrado exitosamente");
      setForm(initialFormState);
      setEditandoId(null);
    }
  }

  // Eliminar y Planificar: Ahora son súper simples
  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro?")) return;
    const { error } = await eliminarEmbarque(id);
    if (error) alert(error.message);
  };

  const handlePlanificar = async (id: number) => {
    if (!confirm("¿Planificar?")) return;
    setSelectedEmbarqueId(id);
    setActiveModule('programacion');
    // planificarEmbarque(id); // Opcional si quieres marcarlo en DB de inmediato
  };

  useEffect(() => {
    if (selectedEmbarqueId && activeModule === 'programacion') {
      const nextNum = contenedores.length + 1;
      setFormProg(prev => ({
        ...prev,
        contenedor: {
          ...initialContenedorState,
          contenedor: `CT_#${nextNum}`,
          foreign_id_embarque: selectedEmbarqueId
        },
        cortes: [{ ...initialCorteState }]
      }));
    }
  }, [contenedores.length, selectedEmbarqueId, activeModule]);

  const handleContenedorInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormProg({
      ...formProg,
      contenedor: { ...formProg.contenedor, [name]: type === 'number' ? Number(value) : value }
    });
  };

  const handleCorteInput = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newCortes = [...formProg.cortes];
    newCortes[index] = { ...newCortes[index], [name]: type === 'number' ? Number(value) : value };
    setFormProg({ ...formProg, cortes: newCortes });
  };

  const agregarCorte = () => {
    setFormProg({ ...formProg, cortes: [...formProg.cortes, { ...initialCorteState }] });
  };

  const eliminarCorte = (index: number) => {
    if (formProg.cortes.length === 1) return;
    const newCortes = formProg.cortes.filter((_, i) => i !== index);
    setFormProg({ ...formProg, cortes: newCortes });
  };

  const handleSubmitProg = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await guardarPlanificacion(formProg.contenedor, formProg.cortes);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Planificación guardada exitosamente");
      setFormProg({
        contenedor: initialContenedorState,
        cortes: [initialCorteState]
      });
      setSelectedEmbarqueId(null);
      setActiveModule('embarques');
    }
  };

  const handleEliminarCorteDB = async (id: number) => {
    if (!confirm("¿Eliminar este corte?")) return;
    const { error } = await eliminarCorteDB(id);
    if (error) alert("Error: " + error.message);
    else alert("Corte eliminado");
  };

  const handleEditarCorte = (corte: any) => {
    alert("Función de edición en desarrollo para corte ID: " + corte.id_corte);
  };

  // --- RENDERS POR MÓDULO ---
  const renderEmbarquesModule = () => (
    <div className="animate-in fade-in duration-500">
      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl mb-10">
        <div className="flex bg-slate-800/50 items-center justify-between border-b border-slate-700">
          <div className="flex">
            {['Comex', 'Carga', 'Incoterms'].map((tab) => (
              <button
                key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-xs font-bold tracking-wider transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="p-4 text-slate-400 hover:text-white text-xs font-bold">
            {collapsed ? 'Ampliar Formulario' : 'Contraer'}
          </button>
        </div>

        {!collapsed && (
          <div className="transition-all">
            {/* DASHBOARD DE CÁLCULOS RÁPIDOS (KPI CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-900/50 border-b border-slate-800">
              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800/60 group">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 group-hover:text-slate-400 transition-colors">Cliente</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <p className="text-lg font-bold text-white truncate">{form.cliente || '---'}</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800/60 group">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 group-hover:text-slate-400 transition-colors">Total Cajas</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                  </div>
                  <p className="text-xl font-mono font-bold text-blue-400">{calculos.total_general.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800/60 group">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 group-hover:text-slate-400 transition-colors">Cut Off Físico</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  </div>
                  <p className="text-lg font-mono font-bold text-orange-400">{isoToDisplay(form.cut_off_fisico) || '---'}</p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800/60 group">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 group-hover:text-slate-400 transition-colors">Incoterm Facturado</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  </div>
                  <p className="text-xl font-mono font-bold text-yellow-500">${calculos.incoterm_facturado.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-5">
              {activeTab === 'Comex' && (
                <>
                  <SelectField label="Agencia" name="agencia_exportadora" value={form.agencia_exportadora} onChange={handleInput}
                    options={['HugoFruit', 'Fresh-Up']} />
                  <SelectField label="Semana" name="semana" value={form.semana} onChange={handleInput}
                    options={['2026-09', '2026-10', '2026-11', '2026-12']}
                  />
                  <Field label="Booking" name="booking" value={form.booking} onChange={handleInput} />
                  <Field label="Nave" name="vessel" value={form.vessel} onChange={handleInput} />
                  <Field label="Voyager" name="voyager" value={form.voyager} onChange={handleInput} />
                  <SelectField label="Naviera" name="naviera" value={form.naviera} onChange={handleInput}
                    options={['HAPPAG LLOYD', 'MAERSK', 'COSCO', 'MSC', 'BALTIC', 'ONE', 'SEATRADE', 'HAMBURG SÜD']}
                  />
                  <Field label="Cliente" name="cliente" value={form.cliente} onChange={handleInput} />
                  <Field label="Puerto Destino" name="puerto_destino_de_descarga" value={form.puerto_destino_de_descarga} onChange={handleInput} />
                  <SelectField label="Depot de Retiro" name="depot_de_retiro" value={form.depot_de_retiro} onChange={handleInput}
                    options={['ARETINA', 'BLASTI', 'DEPCONSA', 'INARPI', 'FARBEM NORTE', 'FARBEM SUR', 'MEDLOG NORTE',
                      'MEDLOG SUR', 'OPACIF NORTE', 'OPACIF SUR', 'PRCS', 'RFS', 'TASAESA', 'TERCON']}
                  />
                  <SelectField label="Almacén / Terminal Portuario" name="almacen_terminal_portuario" value={form.almacen_terminal_portuario} onChange={handleInput}
                    options={['DP WORLD', 'TPG', 'CONTECON', 'NAPORTEC', 'YILPORT', 'FERTISA']}
                  />
                  <SelectField label="Marca" name="marca" value={form.marca} onChange={handleInput}
                    options={['HF AZUL', 'HF LILA', 'HF ROJA', 'GOLDEN B', 'SPAR', 'FRESH-UP', 'ECUALAS', 'AH-TROS', 'SHARBATLY']}
                  />
                  <SelectField label="Tipo De Caja" name="tipo_de_caja" value={form.tipo_de_caja} onChange={handleInput}
                    options={['208', '209', '22XU', 'SF101', 'EXTRAPESADA']}
                  />
                  <SelectField label="Tipo De Embarque" name="tipo_de_embarque" value={form.tipo_de_embarque} onChange={(e) => { handleInput(e); setSubtipoSuelta(''); }}
                    options={['CARGA CONTENERIZADA', 'CARGA SUELTA']}
                  />
                  {form.tipo_de_embarque === 'CARGA SUELTA' && (
                    <SelectField label="Tipo De Carga Suelta" name="subtipo_suelta" value={subtipoSuelta} onChange={(e) => setSubtipoSuelta(e.target.value)}
                      options={['PALETIZADA', 'AL GRANEL']}
                    />
                  )}
                  {form.tipo_de_embarque === 'CARGA CONTENERIZADA' && (
                    <>
                      <Field label="Cant. De Contenedores" name="cant_contenedores" type="number" step="1" value={form.cant_contenedores} onChange={handleInput} />
                      <Field label="Cajas Por Contenedor" name="cajas_x_cont" type="number" step="1" value={form.cajas_x_cont} onChange={handleInput} />
                      <Field label="Cjs.Totales En Contenedores" name="cajas_totales_cont" type="number" value={calculos.cjs_totales_cont} readOnly onChange={handleInput} />
                    </>
                  )}
                  {form.tipo_de_embarque === 'CARGA SUELTA' && subtipoSuelta === 'PALETIZADA' && (
                    <>
                      <Field label="Cant. De Pallets" name="cant_pallets" type="number" step="1" value={form.cant_pallets} onChange={handleInput} />
                      <Field label="Cajas Por Pallet" name="cajas_x_pallet" type="number" step="1" value={form.cajas_x_pallet} onChange={handleInput} />
                      <Field label="Cjs.Totales De Pallets" name="cajas_totales_pallet" type="number" value={calculos.cjs_totales_pallet} readOnly onChange={handleInput} />
                    </>
                  )}
                  {form.tipo_de_embarque === 'CARGA SUELTA' && subtipoSuelta === 'AL GRANEL' && (
                    <Field label="Cjs.Totales Al Granel" name="cajas_totales_granel" type="number" step="1" value={form.cajas_totales_granel} onChange={handleInput} />
                  )}
                  <Field label="Horas Energía Libre" name="horas_energia_libre" type="number" step="1" value={form.horas_energia_libre} onChange={handleInput} />
                  <Field label="Cut Off Físico" name="cut_off_fisico" type="datetime-local" value={form.cut_off_fisico} onChange={handleInput} />
                  <Field label="Cut Off Docs" name="cut_off_docs" type="datetime-local" value={form.cut_off_docs} onChange={handleInput} />
                  <Field label="Inicio Energía Libre" name="inicio_energia_libre" value={calculos.inicio_energia_libre_calc} readOnly onChange={handleInput} />
                  <Field label="Días De Detención Libre" name="detencion_libre" value={form.detencion_libre} onChange={handleInput} />
                  <Field label="Días De Almacenaje Libre" name="almacenaje_libre" value={form.almacenaje_libre} onChange={handleInput} />
                  <Field label="Observaciones" name="observaciones" value={form.observaciones} onChange={handleInput} />
                </>
              )}
              {activeTab === 'Carga' && (
                <>
                  <Field label="Molecula" name="molecula" value={form.molecula} onChange={handleInput} />
                  <Field label="Calidad" name="calidad" value={form.calidad} onChange={handleInput} />
                  <Field label="Pad" name="pad" value={form.pad} onChange={handleInput} />
                  <Field label="Funda" name="funda" value={form.funda} onChange={handleInput} />
                  <Field label="Sachet" name="sachet" value={form.sachet} onChange={handleInput} />
                  <Field label="Peso Neto x Caja" name="pneto_x_caja" value={form.pneto_x_caja} onChange={handleInput} />
                  <Field label="Peso Neto Total" name="pneto_total" type="number" value={calculos.p_neto_total} onChange={handleInput} />
                  <Field label="Peso Bruto x Caja" name="pbruto_x_caja" value={form.pbruto_x_caja} onChange={handleInput} />
                  <Field label="Peso Bruto Total" name="pbruto_total" type="number" value={calculos.p_bruto_total} onChange={handleInput} />
                  <Field label="País De Destino" name="pais_destino" value={form.pais_destino} onChange={handleInput} />
                  <Field label="Ciudad De Destino" name="ciudad_destino" value={form.ciudad_destino} onChange={handleInput} />
                  <Field label="Puerto De Destino De Descarga" name="puerto_destino_de_descarga" value={form.puerto_destino_de_descarga} onChange={handleInput} />
                  <Field label="Destino Final De La Carga" name="destino_final_de_la_carga" value={form.destino_final_de_la_carga} onChange={handleInput} />
                </>
              )}
              {activeTab === 'Incoterms' && (
                <>
                  <Field label="Orden" name="orden" value={form.orden} onChange={handleInput} />
                  <Field label="AUCP" name="aucp" value={form.aucp} onChange={handleInput} />
                  <Field label="DAE" name="dae" value={form.dae} onChange={handleInput} />
                  <Field label="ETD" name="etd" value={form.etd} onChange={handleInput} />
                  <Field label="TTE" name="tte" value={form.tte} onChange={handleInput} />
                  <Field label="ETA" name="eta" value={form.eta} onChange={handleInput} />
                  <Field label="Factura" name="factura" value={form.factura} onChange={handleInput} />
                  <Field label="BL" name="bl" value={form.bl} onChange={handleInput} />
                  <Field label="Regularizado" name="regularizado" value={form.regularizado} onChange={handleInput} />
                  <Field label="Liberación" name="liberacion" value={form.liberacion} onChange={handleInput} />
                  <Field label="Banco" name="banco" value={form.banco} onChange={handleInput} />
                  <Field label="Documentos Enviados" name="documentos_enviados" type="datetime-local" value={form.documentos_enviados} onChange={handleInput} />
                  <Field label="Precio" name="precio_x_caja" type="number" step="0.01" value={form.precio_x_caja} onChange={handleInput} />
                  <SelectField label="Negociación" name="negociacion" value={form.negociacion} onChange={handleInput} options={['CONTRATO', 'SPOT']} />
                  <SelectField label="Incoterms" name="incoterm" value={form.incoterm} onChange={handleInput} options={['FOB', 'CFR', 'CIF']} />
                  <Field label="Incoterms Facturado" name="incoterm_facturado" type="number" step="0.01" value={calculos.incoterm_facturado} readOnly onChange={handleInput} />
                  <Field label="Términos De Pago" name="terminos_de_pago" value={form.terminos_de_pago} onChange={handleInput} />
                  <Field label="Banco" name="banco" value={form.banco} onChange={handleInput} />
                </>
              )}
            </div>

            <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-500 font-mono italic">* Los campos sombreados se calculan automáticamente.</p>
              <button
                type="submit" disabled={loading}
                className={`${editandoId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white px-12 py-3 rounded-lg font-bold transition-all shadow-lg text-sm`}
              >
                {loading ? 'PROCESANDO...' : editandoId ? 'ACTUALIZAR REGISTRO' : 'GUARDAR NUEVO EMBARQUE'}
              </button>
            </div>
          </div>
        )}
      </form>

      <EmbarqueTable
        datos={datos}
        activeTableTab={activeTableTab}
        onEdit={prepararEdicion}       // Esta es tu función local que llena el formulario
        onPlan={handlePlanificar}      // Usa tu función local que tiene el alert confirm
        onDelete={handleEliminar}      // Usa tu función local que tiene el alert confirm
        setActiveTableTab={setActiveTableTab}
      />
    </div>
  );

  const renderProgramacionModule = () => {
    const embarqueActual = datos.find(e => e.id_embarque === selectedEmbarqueId);

    // Siempre mostrar el listado de todos los cortes
    return (
      <div className="animate-in fade-in duration-500 space-y-8">
        {/* TABLA DE TODOS LOS CORTES PLANIFICADOS */}
        <ProgramacionTableAll 
          datos={todosLosCortes} 
          onDelete={handleEliminarCorteDB}
          onEdit={handleEditarCorte}
        />

        {/* BOTÓN PARA NUEVA PLANIFICACIÓN */}
        {!selectedEmbarqueId && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
            <p className="text-slate-400 mb-4">¿Desea planificar un nuevo embarque?</p>
            <p className="text-sm text-slate-500 mb-6">Seleccione un embarque desde el módulo de Embarques y cliquee "Planificar"</p>
            <button
              onClick={() => setActiveModule('embarques')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              IR A EMBARQUES
            </button>
          </div>
        )}

        {/* FORMULARIO DE PLANIFICACIÓN (cuando hay embarque seleccionado) */}
        {selectedEmbarqueId && (
          <>
            <div className="mb-6 bg-slate-900 border border-slate-800 p-6 rounded-xl flex justify-between items-center shadow-lg">
              <div>
                <h3 className="text-lg font-bold text-white">Planificando Embarque: <span className="text-blue-400">{embarqueActual?.booking}</span></h3>
                <p className="text-sm text-slate-400">{embarqueActual?.vessel} - {embarqueActual?.naviera} - {embarqueActual?.cliente}</p>
              </div>
              <button
                onClick={() => setSelectedEmbarqueId(null)}
                className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/10 transition-all"
              >
                Cancelar Planificación
              </button>
            </div>

            <form onSubmit={handleSubmitProg} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 p-4 border-b border-slate-700">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Datos del Contenedor</h4>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-5">
                <Field label="Contenedor" name="contenedor" value={formProg.contenedor.contenedor} onChange={handleContenedorInput} />
                <Field label="Sello Naviero" name="sello_naviero" value={formProg.contenedor.sello_naviero} onChange={handleContenedorInput} />
                <Field label="Sello Exportador" name="sello_exportador" value={formProg.contenedor.sello_exportador} onChange={handleContenedorInput} />
                <Field label="Termógrafo" name="termografo" value={formProg.contenedor.termografo} onChange={handleContenedorInput} />
                <Field label="Tara" name="tara" type="number" value={formProg.contenedor.tara} onChange={handleContenedorInput} />
                <Field label="Peso VGM" name="peso_vgm" type="number" value={formProg.contenedor.peso_vgm} onChange={handleContenedorInput} />
                <Field label="Peso Neto CT" name="peso_neto_ct" type="number" value={formProg.contenedor.peso_neto_ct} onChange={handleContenedorInput} />
              </div>

              <div className="bg-slate-800/50 p-4 border-b border-t border-slate-700 flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Cortes / Productores</h4>
                <button
                  type="button" onClick={agregarCorte}
                  className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/30 transition-all"
                >
                  + Agregar Productor/Corte
                </button>
              </div>

              <div className="p-6 space-y-8">
                {formProg.cortes.map((corte, index) => (
              <div key={index} className="bg-slate-800/30 p-6 rounded-xl border border-slate-800 relative group transition-all hover:bg-slate-800/40">
                <div className="absolute -top-3 left-4 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Productor #{index + 1}
                </div>

                {formProg.cortes.length > 1 && (
                  <button
                    type="button" onClick={() => eliminarCorte(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                  <Field label="Negocia Productor" name="negocia_productor" value={corte.negocia_productor} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Comercial" name="comercial" value={corte.comercial} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Grupo" name="grupo" value={corte.grupo} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Día de Corte" name="dia_de_corte" value={corte.dia_de_corte} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Zona" name="zona" value={corte.zona} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Productor" name="productor" value={corte.productor} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Hacienda" name="hacienda" value={corte.hacienda} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Ubicación" name="ubicacion" value={corte.ubicacion} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Marca" name="marca" value={corte.marca} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Cajas Programadas" name="cajas_programadas" type="number" value={corte.cajas_programadas} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Cartón Desde" name="carton_desde" value={corte.carton_desde} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Consolidación" name="consolidacion" value={corte.consolidacion} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Modalidad" name="modalidad" value={corte.modalidad} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Código Productor" name="codigo_productor" value={corte.codigo_productor} onChange={(e) => handleCorteInput(index, e)} />
                  <Field label="Código MAGAP" name="codigo_magap" value={corte.codigo_magap} onChange={(e) => handleCorteInput(index, e)} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-end">
            <button
              type="submit" disabled={loadingProg}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-3 rounded-lg font-bold transition-all shadow-lg text-sm uppercase tracking-widest"
            >
              {loadingProg ? 'PROCESANDO...' : 'GUARDAR PLANIFICACIÓN'}
            </button>
          </div>
        </form>
        </>
        )}

        <ProgramacionTable datos={programacionCompleta} />
      </div>
    );
  };

  {/* Switchea el Sidebar - Renderizado del contenido */ }
  const renderContent = () => {
    switch (activeModule) {
      case 'embarques': return renderEmbarquesModule();
      case 'programacion': return renderProgramacionModule();
      case 'logistica': return <div className="p-20 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-xl">Módulo de Logística en desarrollo...</div>;
      case 'cupos': return <div className="p-20 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-xl">Módulo de Cupos en desarrollo...</div>;
      default: return null;
    }
  };

  // --- RETURN PRINCIPAL (ESTE ES EL QUE LIMPIAMOS) ---
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* SIDEBAR */}
      <aside className={`transition-all duration-300 ease-in-out border-r border-slate-800 flex flex-col sticky top-0 h-screen bg-slate-900 shadow-2xl z-20
        ${sidebarOpen ? 'w-64' : 'w-20'}`}>

        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center h-[81px]">
          {sidebarOpen && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                <span className="text-white font-black text-lg">HF</span>
              </div>
              <h2 className="text-sm font-black text-white tracking-tighter uppercase">
                Operations <span className="text-blue-500">System</span>
              </h2>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group relative ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                title={item.label}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>

                {sidebarOpen && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300 flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {/* Active Indicator Dot */}
                {isActive && sidebarOpen && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}

                {/* Tooltip for collapsed state (CSS only simple) */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-center py-2 px-3 bg-slate-800/50 rounded-lg">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {sidebarOpen ? 'v1.0.0 - 2026' : 'v1.0'}
            </p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO DINÁMICO - Contenido del MAIN() */}
      <main className="flex-1 p-6 overflow-y-auto">
        <LoadingOverlay visible={isGlobalLoading} />
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 uppercase tracking-tighter">
              {MENU_ITEMS.find(m => m.id === activeModule)?.label}
            </h1>
            <p className="text-slate-400 text-sm">Panel de control de recursos y logística</p>
          </div>
          <div className="flex gap-4">
            {editandoId && (
              <button onClick={() => { setEditandoId(null); setForm(initialFormState); }} className="text-red-400 text-sm font-bold underline">Cancelar Edición</button>
            )}
            <span className="bg-green-900/30 text-green-400 border border-green-800 px-3 py-1 rounded-full text-[10px] self-center">Realtime Activo</span>
          </div>
        </header>

        {/* AQUÍ CONVOCAMOS EL CONTENIDO SEGÚN EL MÓDULO */}
        {renderContent()}
      </main>
    </div>
  );
}
