export interface InventarioStock {
  id_inventario?: number;
  
  id_lote: number;
  vacuna?: string;
  id_ubicacion: number;
  ubicacion?: string;
  cantidad_actual: number;
  fecha_ultima_actualizacion?: string;
  direccion?: string;
  cantidad_sumada?: number;
}

export interface InventarioStockResponse {
  success: boolean;
  data?: InventarioStock | InventarioStock[];
  count?: number;
  mensaje?: string;
  error?: string;
}