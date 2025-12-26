export interface SensorTemp {
    id_sensor?: number;
    codigo_serie: string;
    id_ubicacion_actual: number;
    ultima_calibracion: string;
}

export interface SensorTempResponse {
    success: boolean;
    data?: SensorTemp | SensorTemp[];
    count?: number;
    mensaje?: string;
    error?: string;
}