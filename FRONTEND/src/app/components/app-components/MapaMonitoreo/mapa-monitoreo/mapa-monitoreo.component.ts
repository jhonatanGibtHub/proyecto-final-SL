import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import { RegistroMovimiento } from '../../../../core/models/registroMovimiento';
import { RegistroMovimientoService } from '../../../../core/services/registroMovimiento.service';
import { NotificationService } from '../../../../core/services/notificacion/notificacion-type.service';
import { CommonModule } from '@angular/common';
import { MedicionesTempService } from '../../../../core/services/medicionesTemp.service';
import { AlertasCadenaFrioService } from '../../../../core/services/alertasCadenaFrio.service';
import { InventarioStockService } from '../../../../core/services/inventarioStock.service';
import { LotesService } from '../../../../core/services/lotes.service';

// Solución para compatibilidad de tipos con Leaflet Plugins
const L_ANY: any = L;

@Component({
  selector: 'app-mapa-monitoreo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-monitoreo.component.html',
  styleUrl: './mapa-monitoreo.component.css'
})
export class MapaMonitoreoComponent implements AfterViewInit, OnInit, OnDestroy {
  private animationInterval: any = null;
  private map: any;
  private routingControl: any;
  private marker: any;
  private temperaturaInterval: any = null;

  movimientos: RegistroMovimiento[] = [];
  movimientoSeleccionado: RegistroMovimiento | null = null;
  error: string = '';

  constructor(
    private readonly movimientoService: RegistroMovimientoService,
    private readonly notificationService: NotificationService,
    private readonly medicionesService: MedicionesTempService,
    private readonly alertarServices: AlertasCadenaFrioService,
    private readonly inventarioService: InventarioStockService,
    private readonly lotesService: LotesService,

  ) { }

  private limpiarMovimientoAnterior() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }

    if (this.temperaturaInterval) {
      clearInterval(this.temperaturaInterval);
      this.temperaturaInterval = null;
    }

    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    if (this.routingControl) {
      this.routingControl.setWaypoints([]);
    }
  }

  private generarTemperatura(
    min: number,
    max: number,
    tempActual: number
  ): number {

    const LIMITE_MIN = -99;
    const LIMITE_MAX = 99;

    // Variación realista (1 a 3 grados)
    const variacion = +(Math.random() * (2 - 1) + 1).toFixed(2);

    // Dirección aleatoria
    const direccion = Math.random() < 0.5 ? -1 : 1;

    // Nueva temperatura
    let nuevaTemp = +(tempActual + direccion * variacion).toFixed(2);

    // Límite GLOBAL
    nuevaTemp = Math.min(Math.max(nuevaTemp, LIMITE_MIN), LIMITE_MAX);

    // Validar rango permitido del lote
    if (nuevaTemp < min || nuevaTemp > max) {
      this.notificationService.error(
        nuevaTemp > max ? 'Temperatura máxima excedida' : 'Temperatura mínima violada'
      );
    }

    return nuevaTemp;
  }

  private iniciarEnvioTemperatura() {
    if (!this.movimientoSeleccionado?.medicion) return;

    const idMedicion = this.movimientoSeleccionado.medicion;
    this.temperaturaInterval = setInterval(() => {

      const tempActual = Number(
        this.movimientoSeleccionado?.temperatura ??
        this.movimientoSeleccionado?.minimo
      );

      const minimo = this.movimientoSeleccionado?.minimo ?? -100;
      const maximo = this.movimientoSeleccionado?.maximo ?? 100;

      const nuevaTemp = this.generarTemperatura(
        minimo,
        maximo,
        tempActual
      );

      this.medicionesService.actualizarTemperatura(idMedicion, nuevaTemp)
        .subscribe({
          next: () => {

            this.movimientoSeleccionado!.temperatura = nuevaTemp.toString();
          },
          error: (err) => {
            console.error('Error enviando temperatura', err);
          }
        });

    }, 1000);
  }
  ngOnInit(): void {
    this.cargarMovimientos();
  }
  cargarMovimientos() {
    this.error = '';
    this.movimientoService.obtenerMovimientos().subscribe({
      next: (response) => {

        if (response.success && Array.isArray(response.data)) {
          this.movimientos = response.data;
        } else if (response.error) {
          this.error = response.error;
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar los movimientos: Fallo de conexión.';
        const mensajeError = err.error?.mensaje;
        this.notificationService.error(mensajeError || this.error);
      }
    });
  }


  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  verMovimiento(mov: RegistroMovimiento) {
    this.dropdownOpen = false;

    this.movimientoSeleccionado = mov;


    this.limpiarMovimientoAnterior();

    if (
      !mov.origen_latitud || !mov.origen_longitud ||
      !mov.destino_latitud || !mov.destino_longitud
    ) {
      this.notificationService.error('El movimiento no tiene coordenadas');
      return;
    }

    const origen = L.latLng(mov.origen_latitud, mov.origen_longitud);
    const destino = L.latLng(mov.destino_latitud, mov.destino_longitud);

    this.routingControl.setWaypoints([origen, destino]);

    this.map.fitBounds(
      L.latLngBounds([origen, destino]),
      { padding: [80, 80] }
    );
  }


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
    }).setView([-12.0463, -77.0427], 10);

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
      show: false,
      lineOptions: {
        styles: [{ color: '#04009a', opacity: 0.8, weight: 6 }]
      },
      createMarker: function () {
        return null;
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
  ngOnDestroy(): void {
    if (this.temperaturaInterval) {
      clearInterval(this.temperaturaInterval);
      clearInterval(this.animationInterval);
      this.temperaturaInterval = null;

    }
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

  private actualizarInventarioAlFinalizarMovimiento(): void {
    if (!this.movimientoSeleccionado) return;

    const idInventario = this.movimientoSeleccionado.inventario!;

    if (!idInventario) {
      this.notificationService.info(
        `Parece que no existe un inventario en este lugar`
      );
      return;
    }

    if (this.movimientoSeleccionado!.cantidad === 0) {
      this.notificationService.info(
        `Parece que no se ha enviado ninguna cantidad, o ya fue enviado.`
      );
      return;
    }


    const cantidadMovimiento = Number(this.movimientoSeleccionado.cantidad);

    this.inventarioService
      .actualizarcantidad(
        idInventario,
        cantidadMovimiento
      )
      .subscribe({
        next: (response) => {


          if (response.data && !Array.isArray(response.data)) {
            this.notificationService.success(
              `Inventario actualizado: ${this.movimientoSeleccionado!.cantidad} → ${response.data.cantidad_sumada}`
            );
            this.movimientoSeleccionado!.cantidad = 0 /*response.data.cantidad_sumada*/;

            const id_lote = this.movimientoSeleccionado!.id_lote;


            this.lotesService.actualizarcantidad(
              id_lote,
              0
            ).subscribe(
              {
                next: () => {
                  this.notificationService.success(
                    `Envio Exitoso`
                  );
                }
              }
            )
              ;

          }
        },
        error: (err) => {
          const mensaje =
            err.error?.mensaje || 'Error al actualizar el inventario';
          this.notificationService.error(mensaje);
        }
      });
  }


  private animarCamion(coords: any[]) {
    this.limpiarMovimientoAnterior();

    const carIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
      iconSize: [35, 35],
      iconAnchor: [17, 17]
    });

    this.marker = L.marker(
      [coords[0].lat, coords[0].lng],
      { icon: carIcon }
    ).addTo(this.map);

     // --- AJUSTAR ZOOM ANTES DE INICIAR ANIMACIÓN ---
    this.map.setView([coords[0].lat, coords[0].lng], 15);
    let i = 0;

    // INICIAR ENVÍO DE TEMPERATURA
    this.iniciarEnvioTemperatura();

    this.animationInterval = setInterval(() => {
      if (i < coords.length) {
        this.marker.setLatLng([coords[i].lat, coords[i].lng]);
1
        if (i % 2 === 0) {
          this.map.panTo([coords[i].lat, coords[i].lng]);
        }

        i++;
      } else {
        clearInterval(this.animationInterval);
        this.animationInterval = null;

        // DETENER ENVÍO DE TEMPERATURA
        if (this.temperaturaInterval) {
          clearInterval(this.temperaturaInterval);
          this.temperaturaInterval = null;
        }

        this.marker
          .bindPopup("Vacunas entregadas con éxito")
          .openPopup();
        // ACTUALIZAR INVENTARIO
        this.actualizarInventarioAlFinalizarMovimiento();
        // ACTUALIZAR RECEPCION DEL MOVIMIENTO
        this.recepcionar();

      }
    }, 40);
  }



  private recepcionar(): void {
    if (this.movimientoSeleccionado!.cantidad === 0) {
      
      return;
    }
    
    const id = Number(this.movimientoSeleccionado?.id_movimiento);

    this.movimientoService.recepcion(id).subscribe({
      next: (response: any) => {
        // response contiene lo que tu API envía en JSON
        // Ejemplo: { success: false, mensaje: "Este movimiento ya ha sido marcado..." }
        if (response.success) {
          this.notificationService.success(response.mensaje); // muestra mensaje del backend
        } else {
          this.notificationService.error(response.mensaje); // si backend devuelve error controlado
        }
      },
      error: (err) => {
        // Captura errores de servidor u otros errores HTTP
        this.notificationService.error(err.error?.mensaje || 'Error desconocido');
      }
    });
  }



}