import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';

// Solución para compatibilidad de tipos con Leaflet Plugins
const L_ANY: any = L;

@Component({
  selector: 'app-mapa-monitoreo',
  standalone: true,
  templateUrl: './mapa-monitoreo.component.html',
  styleUrl: './mapa-monitoreo.component.css'
})
export class MapaMonitoreoComponent implements AfterViewInit {
  private map: any;
  private routingControl: any;
  private marker: any;

  ngAfterViewInit(): void {
    // Pequeño retardo para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initMap();
    }, 150);
  }

  
private initMap(): void {
  if (this.map) { this.map.remove(); }
    // 1. Crear el mapa centrado en Lima
    this.map = L.map('map', {
      scrollWheelZoom: true,
      dragging: true
    }).setView([-12.0463, -77.0427], 13);

    // 2. Capa de diseño (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // 3. Configurar el motor de rutas
    this.routingControl = L_ANY.Routing.control({
      waypoints: [],
      geocoder: L_ANY.Control.Geocoder.nominatim(),
      routeWhileDragging: false,
      addWaypoints: false,
      show: true,
      lineOptions: {
        styles: [{ color: '#04009a', opacity: 0.8, weight: 6 }]
      }
    }).addTo(this.map);

    // Escuchar cuando se encuentre una ruta para animar el camión
    this.routingControl.on('routesfound', (e: any) => {
      const coords = e.routes[0].coordinates;
      this.animarCamion(coords);
    });

    // 4. Forzar recalcular tamaño para evitar cuadros grises
    setTimeout(() => {
      this.map.invalidateSize();
    }, 600);
  }

  async iniciarSimulacion(origen: string, destino: string) {
    if (!origen || !destino) {
      alert("Por favor, ingresa punto de partida y llegada.");
      return;
    }

    try {
      // Geocodificación precisa
      const start = await this.geocodificar(origen);
      const end = await this.geocodificar(destino);

      // Dibujar la ruta
      this.routingControl.setWaypoints([
        L.latLng(start.lat, start.lon),
        L.latLng(end.lat, end.lon)
      ]);

      // Ajustar cámara para que se vean ambos puntos
      const bounds = L.latLngBounds([
        [start.lat, start.lon],
        [end.lat, end.lon]
      ]);
      this.map.fitBounds(bounds, { padding: [80, 80] });

    } catch (e) {
      console.error(e);
      alert("No se encontró la dirección exacta. Intenta añadir la ciudad (ej: Jirón de la Unión 300, Lima)");
    }
  }

  private async geocodificar(direccion: string) {
    // Agregamos ", Peru" y parámetros de precisión
    const query = `${direccion}, Peru`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=pe&addressdetails=1`;

    const response = await fetch(url, {
      headers: { 'Accept-Language': 'es' }
    });
    const data = await response.json();

    if (!data || data.length === 0) throw new Error("Dirección no hallada");

    return { 
      lat: parseFloat(data[0].lat), 
      lon: parseFloat(data[0].lon) 
    };
  }

  private animarCamion(coords: any[]) {
    // Limpiar marcador anterior si existe
    if (this.marker) this.map.removeLayer(this.marker);

    const carIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
      iconSize: [35, 35],
      iconAnchor: [17, 17]
    });

    this.marker = L.marker([coords[0].lat, coords[0].lng], { icon: carIcon }).addTo(this.map);

    let i = 0;
    const interval = setInterval(() => {
      if (i < coords.length) {
        this.marker.setLatLng([coords[i].lat, coords[i].lng]);
        
        // Seguir al camión con la cámara suavemente
        if (i % 25 === 0) {
          this.map.panTo([coords[i].lat, coords[i].lng]);
        }
        i += 1; // Velocidad de animación
      } else {
        clearInterval(interval);
        this.marker.bindPopup("<b>✅ Vacunas entregadas con éxito</b>").openPopup();
      }
    }, 40); // Milisegundos entre pasos
  }
}