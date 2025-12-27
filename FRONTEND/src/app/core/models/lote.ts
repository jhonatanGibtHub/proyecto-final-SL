export interface Lote {
    id_lote?: number;
    id_vacuna: number;
    fecha_fabricacion: string;
    fecha_caducidad: string;
    cantidad_inicial_unidades: number;
    vacuna?: string; 
}

export interface LoteResponse {
    success: boolean;
    data?: Lote | Lote[];
    count?: number;
    mensaje?: string;
    error?: string;
}