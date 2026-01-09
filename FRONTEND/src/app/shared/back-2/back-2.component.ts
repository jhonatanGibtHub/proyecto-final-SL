// cube-background.component.ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

interface CubeData {
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  rotationSpeed: THREE.Vector3;
  riseSpeed: number;
  size: number; // tamaño del cubo
}
@Component({
  selector: 'app-back-2',
  imports: [],
  templateUrl: './back-2.component.html'

})
export class Back2Component implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId!: number;

  private cubes: CubeData[] = [];

  // Configuración controlable
  private numberOfCubes = 30;
  private maxRotationSpeed = 0.005;
  private minRiseSpeed = 0.0016;
  private maxRiseSpeed = 0.01;
  private xRange = 40;
  private zRange = 15;
  private yStart = -15; // base para calcular aparición
  private yEnd = 17;    // base para calcular desaparición

  // Colores definidos
  private cubeColor = new THREE.Color('rgb(157, 196, 236)');
  private edgeColor = new THREE.Color('rgba(92, 113, 235, 1)');

  ngOnInit(): void {
    this.initThree();
    this.createCubes(this.numberOfCubes);
    this.animate();

    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }

  private onWindowResize = (): void => {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;

    // Actualizar cámara
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Actualizar renderer
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  };

  private initThree(): void {
    const width = this.canvasContainer.nativeElement.clientWidth;
    const height = this.canvasContainer.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color(0xffffffff);
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, -200);
    this.camera.position.set(0, 0, 20);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = false;
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    /*const ambientLight = new THREE.AmbientLight(0xffffff, 2.3);
    this.scene.add(ambientLight);*/
  }

  private createCubes(count: number): void {
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 1.5 + 0.5;
      const geometry = new THREE.BoxGeometry(size, size, size);

      const material = new THREE.MeshBasicMaterial({
        color: this.cubeColor,
        transparent: true,
        opacity: 0.25
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Posición inicial: completamente debajo del borde inferior
      mesh.position.set(
        (Math.random() - 0.5) * this.xRange,
        this.yStart - size / 2 + Math.random() * (this.yEnd - this.yStart) * 0.1, // pequeño offset aleatorio
        (Math.random() - 0.5) * this.zRange
      );

      this.scene.add(mesh);

      // Bordes
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: this.edgeColor,
        transparent: true,
        opacity: 0.03
      });

      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.position.copy(mesh.position);
      this.scene.add(edges);

      const rotationSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * this.maxRotationSpeed,
        (Math.random() - 0.5) * this.maxRotationSpeed,
        (Math.random() - 0.5) * this.maxRotationSpeed
      );

      const riseSpeed = this.minRiseSpeed + Math.random() * (this.maxRiseSpeed - this.minRiseSpeed);

      this.cubes.push({ mesh, edges, rotationSpeed, riseSpeed, size });
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    for (const cube of this.cubes) {
      // Rotación
      cube.mesh.rotation.x += cube.rotationSpeed.x;
      cube.mesh.rotation.y += cube.rotationSpeed.y;
      cube.mesh.rotation.z += cube.rotationSpeed.z;

      // Subida
      cube.mesh.position.y += cube.riseSpeed;

      // Sincronizar bordes
      cube.edges.rotation.copy(cube.mesh.rotation);
      cube.edges.position.copy(cube.mesh.position);

      // Desaparecer solo cuando el cubo ha pasado completamente el límite superior
      if (cube.mesh.position.y - cube.size / 2 > this.yEnd) {
        // reaparece debajo del borde inferior
        cube.mesh.position.y = this.yStart - cube.size / 2;
        cube.mesh.position.x = (Math.random() - 0.5) * this.xRange;
        cube.mesh.position.z = (Math.random() - 0.5) * this.zRange;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };
}