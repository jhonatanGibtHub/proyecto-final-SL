import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaMonitoreoComponent } from './mapa-monitoreo.component';

describe('MapaMonitoreoComponent', () => {
  let component: MapaMonitoreoComponent;
  let fixture: ComponentFixture<MapaMonitoreoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaMonitoreoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaMonitoreoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
