export interface InventarioStock {
    id_inventario?: number;
    id_lote: number;
    id_ubicacion: number;
    cantidad_actual: number;
    fecha_ultima_actualizacion?: string;
}

export interface InventarioStockResponse {
    success: boolean;
    data?: InventarioStock | InventarioStock[];
    count?: number;
    mensaje?: string;
    error?: string;
}