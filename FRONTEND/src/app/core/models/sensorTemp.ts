export interface SensorTemp {
    id_sensor?: number;
    codigo_serie: string;
    ubicacion_actual?: string;
    id_ubicacion_actual: number;
    ultima_calibracion: string | null;
}

export interface SensorTempResponse {
    success: boolean;
    data?: SensorTemp | SensorTemp[];
    count?: number;
    mensaje?: string;
    error?: string;
}