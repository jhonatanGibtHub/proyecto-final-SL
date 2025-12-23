import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-button-color-theme',
  templateUrl: './button-color-theme.component.html',
  styleUrl: './button-color-theme.component.css'
})
export class ButtonColorThemeComponent implements OnInit {

  TemaSeleccionado: 'light' | 'dark' = 'light';

  ngOnInit(): void {
    this.inicializarTema();
  }

  inicializarTema() {
    const guardado = localStorage.getItem('color-scheme');

    if (guardado === 'dark' || guardado === 'light') {
      this.TemaSeleccionado = guardado;
    } else {
      const prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.TemaSeleccionado = prefiereDark ? 'dark' : 'light';
    }

    this.aplicarTema();

    // Para transiciones suaves después de cargar
    setTimeout(() => {
      document.documentElement.classList.add('color-scheme-transition');
    });
  }

  toggleTema() {
    this.TemaSeleccionado = this.TemaSeleccionado === 'light' ? 'dark' : 'light';
    localStorage.setItem('color-scheme', this.TemaSeleccionado);
    this.aplicarTema();
  }

  aplicarTema() {
    const html = document.documentElement;

    html.classList.remove('color-scheme-light', 'color-scheme-dark');
    html.classList.add(`color-scheme-${this.TemaSeleccionado}`);

    // Esto activa el soporte nativo de colores del navegador
    html.style.colorScheme = this.TemaSeleccionado;
  }

}