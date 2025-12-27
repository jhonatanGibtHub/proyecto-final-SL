export interface AlertaCadenaFrio {
    id_alerta?: number;
    id_medicion: number;
    id_lote: number;
    tipo_alerta: string;
    fecha_alerta?: string;
    estado: string;
    sensor?: string;
    vacuna?: string;
    temp_violada?: number;
}

export interface AlertaCadenaFrioResponse {
    success: boolean;
    data?: AlertaCadenaFrio | AlertaCadenaFrio[];
    count?: number;
    mensaje?: string;
    error?: string;
}