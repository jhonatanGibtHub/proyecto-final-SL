export interface MedicionTemp {
    id_medicion?: number;
    id_sensor?: number;
    id_lote: number;
    temperatura_c: number;
    timestamp_medicion?: string;
    sensor?: string; // for display
    vacuna?:string;
}

export interface MedicionTempResponse {
    success: boolean;
    data?: MedicionTemp | MedicionTemp[];
    count?: number;
    mensaje?: string;
    error?: string;
}