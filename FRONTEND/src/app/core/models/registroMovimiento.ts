export interface RegistroMovimiento {
    id_movimiento: number;
    id_lote: number;
    ubicacion_origen: number;
    ubicacion_destino: number;
    id_transportista: number;
    fecha_envio: string;
    fecha_recepcion?: string;
    lote?: string; // for display
    ubicacion_origen_nombre?: string; // for display
    ubicacion_destino_nombre?: string; // for display
    transportista?: string; // for display
}

export interface RegistroMovimientoResponse {
    success: boolean;
    data?: RegistroMovimiento | RegistroMovimiento[];
    count?: number;
    mensaje?: string;
    error?: string;
}