'use client'

import { isoToDisplay, displayToIso, dateToDisplay } from '@/lib/date-formatter';
import { ChangeEvent, useEffect, useState, FormEvent } from 'react';
import { MenuItem, Embarque, EmbarqueForm } from '@/types/embarque';
import { Field, SelectField } from '@/components/FormFields';
import { useEmbarques } from '@/hooks/useEmbarques';
import { EmbarqueTable } from '@/components/EmbarqueTable';

// Definición de los items del menú con íconos representativos
const MENU_ITEMS: MenuItem[] = [
  { id: 'embarques', label: 'Embarques', icon: '🚢' },
  { id: 'programacion', label: 'Programación', icon: '🍌' },
  { id: 'logistica', label: 'Logística', icon: '🚛' },
  { id: 'terminados', label: 'Tarjas // AISV', icon: '📃' },
  { id: 'agrocalidad', label: 'Agrocalidad', icon: '🌱' },
  { id: 'inventario', label: 'Cupos // Inventario', icon: '🛎️' },
  { id: 'costos', label: 'Costos Operativos', icon: '💱' },
];

// --- COMPONENTE PRINCIPAL ---
export default function DashboardPage() {
  // --- USAMOS EL HOOK ---
  // Traemos los datos y las funciones de acción directamente
  const { datos, loading, guardarEmbarque, eliminarEmbarque, planificarEmbarque } = useEmbarques();

  // --- ESTADOS DE UI (Se mantienen en la página) ---
  const [activeModule, setActiveModule] = useState('embarques');
  const [activeTab, setActiveTab] = useState('Comex');
  const [collapsed, setCollapsed] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [subtipoSuelta, setSubtipoSuelta] = useState('');
  const [activeTableTab, setActiveTableTab] = useState<'resumen' | 'completo'>('resumen');

  const initialFormState: EmbarqueForm = {
    semana: '', booking: '', vessel: '', voyager: '', naviera: '', cliente: '',
    pais_destino: '', ciudad_destino: '', puerto_destino_de_descarga: '',
    destino_final_de_la_carga: '', depot_de_retiro: '', almacen_terminal_portuario: '',
    tipo_de_embarque: '', cant_contenedores: 0, cajas_x_cont: 0, cajas_totales_cont: 0,
    cant_pallets: 0, cajas_x_pallet: 0, cajas_totales_pallet: 0, cajas_totales_granel: 0,
    marca: '', tipo_de_caja: '', calidad: '', pad: '', funda: '', sachet: '',
    molecula: '', pneto_x_caja: 0, pneto_total: 0, pbruto_x_caja: 0, pbruto_total: 0,
    horas_energia_libre: 0, inicio_energia_libre: '', cut_off_fisico: '',
    cut_off_docs: '', detencion_libre: '', almacenaje_libre: '',
    agencia_exportadora: '', observaciones: '', orden: '', aucp: '', dae: '',
    regularizado: '', etd: '', tte: '', eta: '', precio_x_caja: 0, factura: '',
    bl: '', liberacion: '', negociacion: '', terminos_de_pago: '', incoterm: '',
    banco: '', documentos_enviados: '', area_departamento: '', incoterm_facturado: 0
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
    const { error } = await planificarEmbarque(id);
    if (error) alert(error.message);
    else setActiveModule('programacion');
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
            {/* DASHBOARD DE CÁLCULOS RÁPIDOS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-slate-800/30 border-b border-slate-800">
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Cliente</p>
                <p className="text-xl font-mono text-emerald-400">{form.cliente}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Cajas en este Embarque</p>
                <p className="text-xl font-mono text-blue-400">{calculos.total_general.toLocaleString()}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Cut Off</p>
                <p className="text-xl font-mono text-orange-400">{isoToDisplay(form.cut_off_fisico)}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Incoterm Facturado</p>
                <p className="text-xl font-mono text-yellow-500">${calculos.incoterm_facturado.toLocaleString()}</p>
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
                    options={['ARETINA', 'BLASTI', 'DEPCONSA', 'FARBEM NORTE', 'FARBEM SUR', 'MEDLOG NORTE',
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

  const renderProgramacionModule = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold text-blue-400 tracking-tighter italic animate-in fade-in">Programación en desarrollo... activo</h2>
    </div>
  );

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
      <aside className={`transition-all duration-300 ease-in-out border-r border-slate-800 flex flex-col sticky top-0 h-screen bg-slate-900/80 backdrop-blur-md 
        ${sidebarOpen ? 'w-64' : 'w-20'}`}>

        {/* Sidebar - Botón para ocultar/mostrar el sidebar y si mostramos el texto */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          {/* Solo mostramos el texto si está abierto */}
          {sidebarOpen && <h2 className="text-xl font-bold text-blue-400 tracking-tighter italic animate-in fade-in">HF - Operations System</h2>}

          {/* Botón para Toggle (Ocultar/Mostrar) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Sidebar - Listado #Menu de Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeModule === item.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {/* Ocultamos el texto si el sidebar está cerrado */}
              {sidebarOpen && <span className="animate-in fade-in slide-in-from-left-2">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* #Version de AppWeb - Pie de página del sidebar */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center uppercase tracking-widest">
          {sidebarOpen ? 'v1.0.0 - 2026' : 'v1.0'}
        </div>
      </aside>

      {/* CONTENIDO DINÁMICO - Contenido del MAIN() */}
      <main className="flex-1 p-6 overflow-y-auto">
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