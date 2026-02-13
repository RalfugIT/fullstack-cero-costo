'use client'
import { ChangeEvent, useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

// Nueva interfaz/cuerpo para el menú/sidebar
interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

// Definición de los items del menú con íconos representativos
const MENU_ITEMS: MenuItem[] = [
  { id: 'embarques', label: 'Embarques', icon: '🚢' },
  { id: 'programacion', label: 'Programación', icon: '🍌' },
  { id: 'logistica', label: 'Logística', icon: '🚛' },
  { id: 'cupos', label: 'Cupos', icon: '📊' },
];

// --- INTERFACES (Mantenidas y Reforzadas) ---

// Interfaz principal para un embarque, con todos los campos definidos
interface Embarque {
  id_embarque: number;
  semana: string;
  booking: string;
  vessel: string;
  voyager: string;
  naviera: string;
  cliente: string;
  pais_destino: string;
  ciudad_destino: string;
  puerto_destino_de_descarga: string;
  destino_final_de_la_carga: string;
  depot_de_retiro: string;
  almacen_terminal_portuario: string;
  tipo_de_embarque: string;
  cant_contenedores: number;
  cajas_x_cont: number;
  cajas_totales_cont: number;
  cant_pallets: number;
  cajas_x_pallet: number;
  cajas_totales_pallet: number;
  cajas_totales_granel: number;
  marca: string;
  tipo_de_caja: string;
  calidad: string;
  pad: string;
  funda: string;
  sachet: string;
  molecula: string;
  pneto_x_caja: number;
  pneto_total: number;
  pbruto_x_caja: number;
  pbruto_total: number;
  horas_energia_libre: number;
  inicio_energia_libre: string;
  cut_off_fisico: string;
  cut_off_docs: string;
  detencion_libre: string;
  almacenaje_libre: string;
  agencia_exportadora: string;
  observaciones: string;
  orden: string;
  aucp: string;
  dae: string;
  regularizado: string;
  etd: string;
  tte: string;
  eta: string;
  precio_x_caja: number;
  factura: string;
  bl: string;
  liberacion: string;
  negociacion: string;
  terminos_de_pago: string;
  fob: number;
  cfr: number;
  banco: string;
  documentos_enviados: string;
  area_departamento: string;
}

// Tipo para el formulario, omitiendo el id_embarque que es autogenerado, pero permitiendo su inclusión para edición
type EmbarqueForm = Omit<Embarque, 'id_embarque'> & {
  id_embarque?: number;
};

// Props para los componentes de campos/Input, con tipos específicos y sin any
interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

// Props para el componente de campos/InputSelect , con opciones definidas
interface SelectFieldProps {
  label: string;
  name: string;
  value?: string | number;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

// --- COMPONENTE PRINCIPAL ---
export default function DashboardPage() {

  // --- ESTADOS PRINCIPALES ---
  const [activeModule, setActiveModule] = useState('embarques');
  const [datos, setDatos] = useState<Embarque[]>([]);
  const [activeTab, setActiveTab] = useState('comex');
  const [cargando, setCargando] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    bl: '', liberacion: '', negociacion: '', terminos_de_pago: '', fob: 0,
    cfr: 0, banco: '', documentos_enviados: '', area_departamento: ''
  };

  const [form, setForm] = useState<EmbarqueForm>(initialFormState);

  // --- LÓGICA DE CÁLCULOS ---
  const calculos = {
    cjs_totales_cont: Number(form.cant_contenedores) * Number(form.cajas_x_cont),
    cjs_totales_pallet: Number(form.cant_pallets) * Number(form.cajas_x_pallet),
    get total_general() { return this.cjs_totales_cont + Number(form.cajas_totales_granel); },
    get p_neto_total() { return this.total_general * Number(form.pneto_x_caja); },
    get p_bruto_total() { return this.total_general * Number(form.pbruto_x_caja); },
    get total_fob() { return this.total_general * Number(form.precio_x_caja); }
  };

  // --- EFECTOS Y FETCH ---
  async function fetchEmbarques() {
    const { data } = await supabase.from('embarques').select('*').order('id_embarque', { ascending: false });
    if (data) setDatos(data);
  }

  useEffect(() => {
    fetchEmbarques();
    const channel = supabase.channel('realtime-nav')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'embarques' }, () => fetchEmbarques())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- HANDLERS ---
  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? Number(value) : value });
  };

  const prepararEdicion = (reg: Embarque) => {
    setForm({ ...reg } as Embarque);
    setEditandoId(reg.id_embarque);
    setCollapsed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function guardarEmbarque(e: FormEvent) {
    e.preventDefault();
    setCargando(true);

    const datosParaGuardar = {
      ...form,
      cajas_totales_cont: calculos.cjs_totales_cont,
      cajas_totales_pallet: calculos.cjs_totales_pallet,
      pneto_total: calculos.p_neto_total,
      pbruto_total: calculos.p_bruto_total,
      fob: form.fob || calculos.total_fob
    };

    // Corrección del error de Timestamp: Convertimos "" a null
    const payload = Object.fromEntries(
      Object.entries(datosParaGuardar).map(([key, value]) => [
        key, 
        value === "" ? null : value 
      ])
    );

    const { error } = editandoId 
      ? await supabase.from('embarques').update(payload).eq('id_embarque', editandoId)
      : await supabase.from('embarques').insert([payload]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert(editandoId ? "Actualizado correctamente" : "Registrado exitosamente");
      setForm(initialFormState);
      setEditandoId(null);
    }
    setCargando(false);
  }

  async function eliminarEmbarque(id: number) {
    if (!confirm("¿Está seguro de eliminar este embarque?")) return;
    const { error } = await supabase.from('embarques').delete().eq('id_embarque', id);
    if (error) alert(error.message);
  }

  // --- RENDERS POR MÓDULO ---
  const renderEmbarquesModule = () => (
    <div className="animate-in fade-in duration-500">
      {/* FORMULARIO */}
      <form onSubmit={guardarEmbarque} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl mb-10">
        <div className="flex bg-slate-800/50 items-center justify-between border-b border-slate-700">
          <div className="flex">
            {['comex', 'carga', 'financiero'].map((tab) => (
              <button 
                key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="p-4 text-slate-400 hover:text-white text-xs font-bold">
            {collapsed ? 'AMPLIAR FORMULARIO' : 'CONTRAER'}
          </button>
        </div>

        {!collapsed && (
          <div className="transition-all">
            {/* DASHBOARD DE CÁLCULOS RÁPIDOS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-slate-800/30 border-b border-slate-800">
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Cajas</p>
                <p className="text-xl font-mono text-blue-400">{calculos.total_general.toLocaleString()}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Peso Neto (Kg)</p>
                <p className="text-xl font-mono text-emerald-400">{calculos.p_neto_total.toLocaleString()}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Peso Bruto (Kg)</p>
                <p className="text-xl font-mono text-orange-400">{calculos.p_bruto_total.toLocaleString()}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Valor FOB Est.</p>
                <p className="text-xl font-mono text-yellow-500">${calculos.total_fob.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-5">
              {activeTab === 'comex' && (
                <>
                  <SelectField label="Agencia" name="agencia_exportadora" value={form.agencia_exportadora} onChange={handleInput} options={['HugoFruit', 'Fresh Up', 'Mia Calidad']} />
                  <Field label="Semana" name="semana" value={form.semana} onChange={handleInput} />
                  <Field label="Booking" name="booking" value={form.booking} onChange={handleInput} />
                  <Field label="Nave" name="vessel" value={form.vessel} onChange={handleInput} />
                  <Field label="Puerto Destino" name="puerto_destino_de_descarga" value={form.puerto_destino_de_descarga} onChange={handleInput} />
                  <Field label="Cut Off Físico" name="cut_off_fisico" type="datetime-local" value={form.cut_off_fisico} onChange={handleInput} />
                </>
              )}
              {activeTab === 'carga' && (
                <>
                  <Field label="Cant. Contenedores" name="cant_contenedores" type="number" value={form.cant_contenedores} onChange={handleInput} />
                  <Field label="Cjs x Contenedor" name="cajas_x_cont" type="number" value={form.cajas_x_cont} onChange={handleInput} />
                  <Field label="Total Cjs Cont." name="cajas_totales_cont" value={calculos.cjs_totales_cont} readOnly onChange={handleInput} />
                  <Field label="Cjs a Granel" name="cajas_totales_granel" type="number" value={form.cajas_totales_granel} onChange={handleInput} />
                  <div className="border-l border-slate-700 mx-2 hidden md:block"></div>
                  <Field label="P. Neto x Caja" name="pneto_x_caja" type="number" value={form.pneto_x_caja} onChange={handleInput} />
                  <Field label="P. Bruto x Caja" name="pbruto_x_caja" type="number" value={form.pbruto_x_caja} onChange={handleInput} />
                </>
              )}
              {activeTab === 'financiero' && (
                <>
                  <Field label="Precio x Caja" name="precio_x_caja" type="number" value={form.precio_x_caja} onChange={handleInput} />
                  <Field label="FOB Manual" name="fob" type="number" value={form.fob} onChange={handleInput} />
                  <Field label="Factura" name="factura" value={form.factura} onChange={handleInput} />
                  <SelectField label="Negociación" name="negociacion" value={form.negociacion} onChange={handleInput} options={['FOB', 'CFR', 'CIF']} />
                  <Field label="Banco" name="banco" value={form.banco} onChange={handleInput} />
                </>
              )}
            </div>

            <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-between items-center">
              <p className="text-xs text-slate-500 font-mono italic">* Los campos sombreados se calculan automáticamente.</p>
              <button 
                type="submit" disabled={cargando}
                className={`${editandoId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white px-12 py-3 rounded-lg font-bold transition-all shadow-lg text-sm`}
              >
                {cargando ? 'PROCESANDO...' : editandoId ? 'ACTUALIZAR REGISTRO' : 'GUARDAR NUEVO EMBARQUE'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* TABLA DE REGISTROS */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Registros Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-400 uppercase">
              <tr>
                <th className="p-4">Semana</th>
                <th className="p-4">Booking / Nave</th>
                <th className="p-4">Cliente</th>
                <th className="p-4 text-center">Cajas Totales</th>
                <th className="p-4 text-center">FOB Est.</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {datos.map((reg) => (
                <tr key={reg.id_embarque} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-blue-400">{reg.semana}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-200">{reg.booking}</div>
                    <div className="text-[10px] text-slate-500">{reg.vessel}</div>
                  </td>
                  <td className="p-4 font-medium">{reg.cliente}</td>
                  <td className="p-4 text-center font-mono">{(Number(reg.cajas_totales_cont) + Number(reg.cajas_totales_granel)).toLocaleString()}</td>
                  <td className="p-4 text-center text-yellow-500 font-mono">${reg.fob?.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => prepararEdicion(reg)} className="text-blue-400 hover:text-blue-300">Editar</button>
                      <button onClick={() => eliminarEmbarque(reg.id_embarque)} className="text-red-500 hover:text-red-400 font-bold">X</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeModule) {
      case 'embarques': return renderEmbarquesModule();
      case 'programacion': return <div className="p-20 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-xl">Módulo de Operaciones en desarrollo...</div>;
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
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          {/* Solo mostramos el texto si está abierto */}
          {sidebarOpen && <h2 className="text-xl font-bold text-blue-400 tracking-tighter italic animate-in fade-in">HF-SYSTEM</h2>}
          
          {/* Botón para Toggle (Ocultar/Mostrar) */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeModule === item.id 
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

        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center uppercase tracking-widest">
          {sidebarOpen ? 'v1.0.2 - 2026' : 'v1.0'}
        </div>
      </aside>

      {/* CONTENIDO DINÁMICO */}
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
// --- COMPONENTES ATÓMICOS CORREGIDOS (Sin any) ---

// Componente de campo genérico para el ingreso de datos tipeados, con props tipados y sin uso de any
function Field({ label, name, type = "text", value, onChange, readOnly }: FieldProps) {
  return (
    <div className="flex flex-col">
      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">{label}</label>
      <input 
        type={type} name={name} value={value ?? ""} onChange={onChange} readOnly={readOnly}
        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white"
      />
    </div>
  );
}
// Componente de campo genérico para el ingreso de datos enlistados, con props tipados y sin uso de any
function SelectField({ label, name, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">{label}</label>
      <select 
        name={name} value={value ?? ""} onChange={onChange}
        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white appearance-none"
      >
        <option value="">Seleccione...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}