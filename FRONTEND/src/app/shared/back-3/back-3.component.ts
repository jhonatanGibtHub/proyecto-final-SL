import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnDestroy
} from '@angular/core';
import * as THREE from 'three';

interface HoverData {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  targetColor: THREE.Color;
}

@Component({
  selector: 'app-back-3',
  templateUrl: './back-3.component.html'
})
export class Back3Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  /* Grid tuning               */

  private readonly CELL_SIZE = 100;
  private readonly MAX_SCALE = 0.5;
  private readonly EXTRA_ROWS = 2;
  private readonly EXTRA_COLS = 2;

  private gridCols = 0;
  private gridRows = 0;

  private cellSize = this.CELL_SIZE;
  private scale = 1;

  private offsetX = 0;
  private offsetY = 0;

  /* Visual                    */

  private fillColor = '#f6fcff';
  private borderColor = '#d6d6d6';
  private speed = 0.2;

  /* Hover                     */

  private hoverEnabled = false;

  private hoverColor = new THREE.Color('#d2e4ff');
  private hoverFadeSpeed = 0.08;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private hoverItems: HoverData[] = [];
  private hovered?: HoverData;

  /* Focus / Opacidad          */

  private focusRadius = 300;
  private focusColor = new THREE.Color('#89d2ff');
  private edgeDarkness = 0.15;
  private edgeFalloff = 400;

  private focusOverlay!: THREE.Mesh;
  private focusMaterial!: THREE.ShaderMaterial;

  /* Three core                */

  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;

  private squares: THREE.Mesh[] = [];
  private edges: THREE.LineSegments[] = [];

  private width = 0;
  private height = 0;

  private raf = 0;

  /* Lifecycle                 */

  ngAfterViewInit() {
    this.initThree();
    this.rebuildGrid();
    this.createFocusOverlay();
    this.animate();

    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.dispose();
  }

  /* Hover control API         */

  public enableHover() {
    this.hoverEnabled = true;
  }

  public disableHover() {
    this.hoverEnabled = false;

    if (this.hovered) {
      this.hovered.targetColor.set(this.fillColor);
      this.hovered = undefined;
    }
  }

  /* Init                      */

  private updateSize() {
    const el = this.canvasContainer.nativeElement;
    this.width = el.clientWidth;
    this.height = el.clientHeight;
  }

  private initThree() {
    this.updateSize();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.fillColor);

    this.camera = new THREE.OrthographicCamera(
      0,
      this.width,
      this.height,
      0,
      -10,
      10
    );
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  /* Grid logic                */

  private computeGrid() {
    this.gridCols = Math.max(1, Math.floor(this.width / this.CELL_SIZE));
    this.gridRows = Math.max(
      1,
      Math.round(this.gridCols * (this.height / this.width))
    );

    const scaleX = this.width / (this.gridCols * this.CELL_SIZE);
    const scaleY = this.height / (this.gridRows * this.CELL_SIZE);
    this.scale = Math.min(scaleX, scaleY);

    if (this.scale > this.MAX_SCALE) {
      this.gridCols++;
      this.gridRows = Math.round(
        this.gridCols * (this.height / this.width)
      );
      this.scale = Math.min(
        this.width / (this.gridCols * this.CELL_SIZE),
        this.height / (this.gridRows * this.CELL_SIZE)
      );
    }

    this.cellSize = this.CELL_SIZE * this.scale;

    this.offsetX = (this.width - this.gridCols * this.cellSize) / 2;
    this.offsetY = (this.height - this.gridRows * this.cellSize) / 2;
  }

  private rebuildGrid() {
    this.clearGrid();
    this.updateSize();
    this.computeGrid();

    const geometry = new THREE.PlaneGeometry(this.cellSize, this.cellSize);
    const totalRows = this.gridRows * this.EXTRA_ROWS;

    for (let col = -this.EXTRA_COLS; col < this.gridCols + this.EXTRA_COLS; col++) {
      for (let row = 0; row < totalRows; row++) {

        const x = this.offsetX + (col + 0.5) * this.cellSize;
        const y =
          this.offsetY +
          (row + 0.5) * this.cellSize -
          this.gridRows * this.cellSize;

        const material = new THREE.MeshBasicMaterial({ color: this.fillColor });
        const square = new THREE.Mesh(geometry, material);

        square.position.set(x, y, 0);
        this.scene.add(square);
        this.squares.push(square);

        this.hoverItems.push({
          mesh: square,
          material,
          targetColor: new THREE.Color(this.fillColor)
        });

        const edge = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: this.borderColor })
        );

        edge.position.copy(square.position);
        this.scene.add(edge);
        this.edges.push(edge);
      }
    }
  }

  private clearGrid() {
    [...this.squares, ...this.edges].forEach(o => {
      o.geometry.dispose();
      this.scene.remove(o);
    });

    this.squares = [];
    this.edges = [];
    this.hoverItems = [];
  }

  /* Hover logic               */

  private onMouseMove = (e: MouseEvent) => {
    if (!this.hoverEnabled) return;

    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.squares);

    if (hits.length) {
      const mesh = hits[0].object as THREE.Mesh;
      const item = this.hoverItems.find(h => h.mesh === mesh);

      if (item && this.hovered !== item) {
        if (this.hovered) {
          this.hovered.targetColor.set(this.fillColor);
        }

        this.hovered = item;
        item.targetColor.copy(this.hoverColor);
      }
    } else if (this.hovered) {
      this.hovered.targetColor.set(this.fillColor);
      this.hovered = undefined;
    }
  };

  /* Focus Overlay             */

  private createFocusOverlay() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height);

    this.focusMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(this.width, this.height) },
        u_center: { value: new THREE.Vector2(this.width / 2, this.height / 2) },
        u_radius: { value: this.focusRadius },
        u_edgeDark: { value: this.edgeDarkness },
        u_edgeFalloff: { value: this.edgeFalloff },
        u_color: { value: this.focusColor }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 u_resolution;
        uniform vec2 u_center;
        uniform float u_radius;
        uniform float u_edgeDark;
        uniform float u_edgeFalloff;
        uniform vec3 u_color;
        varying vec2 vUv;
        void main() {
          vec2 coord = vUv * u_resolution;
          float dist = distance(coord, u_center);
          float alpha = smoothstep(u_radius, u_radius + u_edgeFalloff, dist) * u_edgeDark;
          gl_FragColor = vec4(u_color, alpha);
        }
      `,
      transparent: true
    });

    this.focusOverlay = new THREE.Mesh(geometry, this.focusMaterial);
    this.focusOverlay.position.set(this.width / 2, this.height / 2, 1);
    this.scene.add(this.focusOverlay);
  }

  /* Animation                 */

  private animate = () => {
    this.raf = requestAnimationFrame(this.animate);

    const limit = this.gridRows * this.cellSize;

    this.squares.forEach((square, i) => {
      square.position.y += this.speed;

      if (square.position.y - this.cellSize / 2 >= this.offsetY + limit) {
        square.position.y -= limit * this.EXTRA_ROWS;
      }

      this.edges[i].position.y = square.position.y;
    });

    this.hoverItems.forEach(h =>
      h.material.color.lerp(h.targetColor, this.hoverFadeSpeed)
    );

    this.renderer.render(this.scene, this.camera);
  };

  /* Resize                    */

  private onResize = () => {
    this.updateSize();

    this.camera.right = this.width;
    this.camera.top = this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);

    this.rebuildGrid();
    this.updateFocusOverlay();
  };

  private updateFocusOverlay() {
    this.focusOverlay.geometry.dispose();
    this.focusOverlay.geometry = new THREE.PlaneGeometry(this.width, this.height);

    this.focusOverlay.position.set(this.width / 2, this.height / 2, 1);

    this.focusMaterial.uniforms['u_resolution'].value.set(
      this.width,
      this.height
    );
    this.focusMaterial.uniforms['u_center'].value.set(
      this.width / 2,
      this.height / 2
    );
  }
}