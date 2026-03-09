// Nueva interfaz/cuerpo para el menú/sidebar
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
}

// --- INTERFACES (ESTRUCTURAS DE DATOS//CAMPOS Mantenidas y Reforzadas) ---

// Interfaz principal para un embarque, con todos los campos definidos
export interface Embarque {
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
    incoterm: string;
    banco: string;
    documentos_enviados: string;
    area_departamento: string;
    incoterm_facturado: number;
}

// Tipo para el formulario, omitiendo el id_embarque que es autogenerado, pero permitiendo su inclusión para edición
export type EmbarqueForm = Omit<Embarque, 'id_embarque'> & {
    id_embarque?: number;
};