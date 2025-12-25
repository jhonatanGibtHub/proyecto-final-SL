export interface Vacuna {

    id_vacuna?: number;
    nombre_comercial: string;
    fabricante: string;
    temp_min_c: number; 
    temp_max_c: number; 
}

export interface VacunaResponse {
    success: boolean;
    data?: Vacuna | Vacuna[];
    count?: number;
    mensaje?: string;
    error?: string;
}