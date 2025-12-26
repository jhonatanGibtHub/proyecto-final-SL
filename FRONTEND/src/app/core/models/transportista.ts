export interface Transportista {
    id_transportista?: number;
    nombre: string;
    licencia: string;
    telefono?: string;
    tipo_vehiculo: 'Camión Refrigerado' | 'Avión' | 'Furgoneta';
}

export interface TransportistaResponse {
    success: boolean;
    data?: Transportista | Transportista[];
    count?: number;
    mensaje?: string;
    error?: string;
}