export interface Ubicacion {
    id_ubicacion?: number;
    nombre: string;
    tipo: 'Almacén Central' | 'Distribuidor' | 'Centro de Salud';
    distrito: string;
    provincia: string;
}

export interface UbicacionResponse {
    success: boolean;
    data?: Ubicacion | Ubicacion[];
    count?: number;
    mensaje?: string;
    error?: string;
}