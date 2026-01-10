import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import { Subscription } from 'rxjs';
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
  styleUrls: ['./mapa-monitoreo.component.css']
})
export class MapaMonitoreoComponent implements AfterViewInit, OnInit, OnDestroy {

  private map: any;
  private routingControl: any;
  private marker: any;

  private temperaturaInterval: any = null;
  private animationInterval: any = null;

  private subscriptions: Subscription[] = [];

  movimientos: RegistroMovimiento[] = [];
  movimientoSeleccionado: RegistroMovimiento | null = null;
  error: string = '';

  dropdownOpen = false;

  constructor(
    private readonly movimientoService: RegistroMovimientoService,
    private readonly notificationService: NotificationService,
    private readonly medicionesService: MedicionesTempService,
    private readonly alertarServices: AlertasCadenaFrioService,
    private readonly inventarioService: InventarioStockService,
    private readonly lotesService: LotesService,
  ) { }

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.limpiarMovimientoAnterior();
    // Cancelar todas las subscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  private cargarMovimientos(): void {
    const sub = this.movimientoService.obtenerMovimientos().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.movimientos = response.data;
        } else {
          this.error = response.error || 'Error al cargar movimientos.';
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error de conexión con el servidor.';
        this.notificationService.error(err.error?.mensaje || this.error);
      }
    });
    this.subscriptions.push(sub);
  }

  private initMap(): void {
    if (this.map) this.map.remove();

    this.map = L.map('map', { scrollWheelZoom: true, dragging: true })
      .setView([-12.0463, -77.0427], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.routingControl = L_ANY.Routing.control({
      waypoints: [],
      geocoder: L_ANY.Control.Geocoder.nominatim(),
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      lineOptions: { styles: [{ color: '#04009a', opacity: 0.8, weight: 6 }] },
      createMarker: () => null
    }).addTo(this.map);

    this.routingControl.on('routesfound', (e: any) => {
      const coords = e.routes[0].coordinates;
      this.animarCamion(coords);
    });

    setTimeout(() => this.map.invalidateSize(), 600);
  }

  verMovimiento(mov: RegistroMovimiento) {
    this.dropdownOpen = false;
    this.movimientoSeleccionado = mov;
    this.limpiarMovimientoAnterior();

    if (!mov.origen_latitud || !mov.origen_longitud || !mov.destino_latitud || !mov.destino_longitud) {
      this.notificationService.error('El movimiento no tiene coordenadas');
      return;
    }

    const origen = L.latLng(mov.origen_latitud, mov.origen_longitud);
    const destino = L.latLng(mov.destino_latitud, mov.destino_longitud);

    this.routingControl.setWaypoints([origen, destino]);
    this.map.fitBounds(L.latLngBounds([origen, destino]), { padding: [80, 80] });
  }

  private limpiarMovimientoAnterior(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);
    if (this.temperaturaInterval) clearInterval(this.temperaturaInterval);

    this.animationInterval = null;
    this.temperaturaInterval = null;

    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    if (this.routingControl) this.routingControl.setWaypoints([]);
  }

  private generarTemperatura(min: number, max: number, tempActual: number): number {
    const LIMITE_MIN = -99;
    const LIMITE_MAX = 99;
    const variacion = +(Math.random() + 1).toFixed(2); // 1 a 2
    const direccion = Math.random() < 0.5 ? -1 : 1;
    let nuevaTemp = +(tempActual + direccion * variacion).toFixed(2);
    nuevaTemp = Math.min(Math.max(nuevaTemp, LIMITE_MIN), LIMITE_MAX);

    const id_med = this.movimientoSeleccionado?.medicion;
    const id_lot = this.movimientoSeleccionado?.id_lote;

    let tipo = 'Estable';
    let estado = 'Resuelta';

    if (nuevaTemp < min || nuevaTemp > max) {
      tipo = nuevaTemp > max ? 'Máx. Excedida' : 'Mín. Violada';
      estado = 'Activa';
      this.notificationService.error(
        nuevaTemp > max ? 'Temperatura máxima excedida' : 'Temperatura mínima violada'
      );
    }

    if (id_med && id_lot) {
      const sub = this.alertarServices.enviarAlerta(id_med, id_lot, tipo, estado).subscribe();
      this.subscriptions.push(sub);
    }

    return nuevaTemp;
  }

  private iniciarEnvioTemperatura() {
    if (!this.movimientoSeleccionado?.medicion) return;

    const idMedicion = this.movimientoSeleccionado.medicion;

    this.temperaturaInterval = setInterval(() => {
      const tempActual = Number(this.movimientoSeleccionado?.temperatura ?? this.movimientoSeleccionado?.minimo);
      const minimo = this.movimientoSeleccionado?.minimo ?? -100;
      const maximo = this.movimientoSeleccionado?.maximo ?? 100;

      const nuevaTemp = this.generarTemperatura(minimo, maximo, tempActual);

      const sub = this.medicionesService.actualizarTemperatura(idMedicion, nuevaTemp).subscribe({
        next: () => this.movimientoSeleccionado!.temperatura = nuevaTemp.toString(),
        error: (err) => console.error('Error actualizando temperatura:', err)
      });
      this.subscriptions.push(sub);
    }, 5000); // actualizamos cada 5 segundos
  }

  private animarCamion(coords: any[]) {
    this.limpiarMovimientoAnterior();

    if (!coords || coords.length === 0) return;

    const carIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
      iconSize: [35, 35],
      iconAnchor: [17, 17]
    });

    this.marker = L.marker([coords[0].lat, coords[0].lng], { icon: carIcon }).addTo(this.map);
    this.map.setView([coords[0].lat, coords[0].lng]);

    let i = 0;
    this.iniciarEnvioTemperatura();

    this.animationInterval = setInterval(() => {
      if (i < coords.length) {
        this.marker.setLatLng([coords[i].lat, coords[i].lng]);
        if (i % 2 === 0) this.map.panTo([coords[i].lat, coords[i].lng]);
        i++;
      } else {
        clearInterval(this.animationInterval);
        this.animationInterval = null;

        if (this.temperaturaInterval) {
          clearInterval(this.temperaturaInterval);
          this.temperaturaInterval = null;
        }

        this.marker.bindPopup("Vacunas entregadas con éxito").openPopup();
        this.actualizarInventarioAlFinalizarMovimiento();
        this.recepcionar();
        this.cargarMovimientos();
      }
    }, 40);
  }

  private actualizarInventarioAlFinalizarMovimiento(): void {
    if (!this.movimientoSeleccionado) return;
    const idInventario = this.movimientoSeleccionado.inventario;
    if (!idInventario || this.movimientoSeleccionado.cantidad === 0) return;

    const cantidadMovimiento = Number(this.movimientoSeleccionado.cantidad);

    const sub = this.inventarioService.actualizarcantidad(idInventario, cantidadMovimiento).subscribe({
      next: (response) => {
        this.movimientoSeleccionado!.cantidad = 0;
        const id_lote = this.movimientoSeleccionado!.id_lote;
        if (id_lote) {
          const loteSub = this.lotesService.actualizarcantidad(id_lote, 0).subscribe();
          this.subscriptions.push(loteSub);
        }
      },
      error: (err) => console.error('Error actualizando inventario:', err)
    });
    this.subscriptions.push(sub);
  }

  private recepcionar(): void {
    if (!this.movimientoSeleccionado?.id_movimiento) return;
    const id = Number(this.movimientoSeleccionado.id_movimiento);

    const sub = this.movimientoService.recepcion(id).subscribe({
      next: (response: any) => {
        if (response.success) this.notificationService.success(response.mensaje);
        else this.notificationService.error(response.mensaje);
      },
      error: (err) => this.notificationService.error(err.error?.mensaje || 'Error desconocido')
    });
    this.subscriptions.push(sub);
  }
}