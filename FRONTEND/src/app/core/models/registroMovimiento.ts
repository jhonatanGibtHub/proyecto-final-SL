export interface RegistroMovimiento {
    id_movimiento: number;
    id_lote: number;
    ubicacion_origen: number;
    ubicacion_destino: number;
    id_transportista: number;
    fecha_envio: string;
    fecha_recepcion?: string;
    lote?: string; 
    vacuna?: string;
    ubicacion_origen_nombre?: string; 
    ubicacion_destino_nombre?: string; 
    transportista?: string;

    origen_latitud?:number;
    origen_longitud?:number;

    destino_latitud?:number;
    destino_longitud?:number;

    caducidad?: string;
    cantidad?: number;
    temperatura?: string;

    medicion?: number;
    id_sensor?: number;
    minimo?: number;
    maximo?: number;

    inventario?: number;
    origen?:string,
    destino?:string,
}

export interface RegistroMovimientoResponse {
    success: boolean;
    data?: RegistroMovimiento | RegistroMovimiento[];
    count?: number;
    mensaje?: string;
    error?: string;
}