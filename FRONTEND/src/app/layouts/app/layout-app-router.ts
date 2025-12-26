import { Routes } from '@angular/router';
import { AppMainComponent } from '../../components/app-components/app-main/app-main.component';
import { AppRouterComponent } from './app-router.component';
import { AuthGuard } from '../../core/guards/Auth.guard';
import { AppVacunaListComponent } from '../../components/app-components/Vacunas/app-vacuna-list/app-vacuna-list.component';
import { AppUbicacionListComponent } from '../../components/app-components/Ubicaciones/app-ubicacion-list/app-ubicacion-list.component';
import { AppTransportistaListComponent } from '../../components/app-components/Transportistas/app-transportista-list/app-transportista-list.component';
import { AppInventarioStockListComponent } from '../../components/app-components/InventarioStock/app-inventario-stock-list/app-inventario-stock-list.component';
import { AppSensorTempListComponent } from '../../components/app-components/SensoresTemp/app-sensor-temp-list/app-sensor-temp-list.component';

export const AppRoutes: Routes = [
  {
    path: '', component: AppRouterComponent, canActivate: [AuthGuard],
    children: [
     { path: '', component: AppMainComponent, canActivate: [AuthGuard]},
     { path: 'vacunas', component: AppVacunaListComponent, canActivate: [AuthGuard]},
     { path: 'ubicaciones', component: AppUbicacionListComponent, canActivate: [AuthGuard]},
     { path: 'transportistas', component: AppTransportistaListComponent, canActivate: [AuthGuard]},
     { path: 'inventario-stock', component: AppInventarioStockListComponent, canActivate: [AuthGuard]},
     { path: 'sensores-temp', component: AppSensorTempListComponent, canActivate: [AuthGuard]},
    ]
  }
];