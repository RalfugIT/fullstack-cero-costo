export interface Contenedor {
  id_contenedor?: number;
  created_at?: string;
  contenedor: string;
  sello_naviero: string;
  sello_exportador: string;
  termografo: string;
  foreign_id_embarque: number;
  tara: number;
  peso_vgm: number;
  peso_neto_ct: number;
}

export interface Corte {
  id_corte?: number;
  created_at?: string;
  negocia_productor: string;
  comercial: string;
  grupo: string;
  dia_de_corte: string;
  zona: string;
  productor: string;
  hacienda: string;
  ubicacion: string;
  marca: string;
  foreign_id_contenedor: number;
  cajas_programadas: number;
  carton_desde: string;
  consolidacion: string;
  modalidad: string;
  codigo_productor: string;
  codigo_magap: string;
}

export interface ProgramacionForm {
  contenedor: Partial<Contenedor>;
  cortes: Partial<Corte>[];
}
