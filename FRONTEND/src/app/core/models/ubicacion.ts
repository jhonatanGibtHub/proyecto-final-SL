export interface Ubicacion {
    id_ubicacion?: number;
    nombre: string;
    tipo: 'Almacén Central' | 'Distribuidor' | 'Centro de Salud';
    direccion: string;
    ubicacionTexto: string;

    distrito?: string;
    provincia?: string;
    region?: string;

    latitud?: number;
    longitud?: number;
    ciudad?: string;
}

export interface UbicacionResponse {
    success: boolean;
    data?: Ubicacion | Ubicacion[];
    count?: number;
    mensaje?: string;
    error?: string;
}