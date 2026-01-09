import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { gsap } from 'gsap';

@Component({
  selector: 'app-web-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './web-main.component.html',
  styleUrl: './web-main.component.css'
})
export class WebMainComponent implements AfterViewInit, OnDestroy {

  private currentIndex = 0;
  private isAnimating = false;
  private sections: HTMLElement[] = [];
  private sectionTimelines = new Map<HTMLElement, gsap.core.Timeline>();

  // INIT
  ngAfterViewInit() {

    // Obtener secciones
    this.sections = gsap.utils.toArray<HTMLElement>('.scroll-section');

    // CREAR ANIMACIONES
    this.sections.forEach(section => {

      // ---------- PRESENT ----------
      if (section.classList.contains('section-present')) {
        const tl = gsap.timeline({ paused: true });

        tl.from(section.querySelector('.text-present'), {
          opacity: 0,
          x: -50,
          duration: 0.5,
          ease: 'power2.out'
        });

        section.querySelectorAll('.float-img').forEach((img, i) => {
          tl.from(img, {
            opacity: 0,
            x: 50,
            duration: 0.8,
            ease: 'power2.out'
          }, '-=0.6');

          // flotación infinita
          gsap.to(img, {
            y: i % 2 === 0 ? -30 : 30,
            duration: 3 + i,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });

        this.sectionTimelines.set(section, tl);
      }

      // ---------- APP ----------
      if (section.classList.contains('section-app')) {
        const tl = gsap.timeline({ paused: true });

        tl.from(section.querySelector('.info'), {
          opacity: 0,
          x: -50,
          duration: 1
        }).from(section.querySelector('.img'), {
          opacity: 0,
          x: 120,
          duration: 0.3
        }, '-=0.6')

          .from(section.querySelector('.img'), {

            height: 100,
            duration: 0.5
          })


          ;

        this.sectionTimelines.set(section, tl);
      }

      // ---------- MESSAGE ----------
      if (section.classList.contains('section-message')) {
        const tl = gsap.timeline({ paused: true });

        tl.from(section.querySelector('.info'), {
          opacity: 0,
          x: -40,
          duration: 1
        }).from(section.querySelector('.img'), {
          opacity: 0,
          x: 40,
          duration: 1
        }, '-=0.6');

        this.sectionTimelines.set(section, tl);
      }

      if (section.classList.contains('section-supported')) {
        const tl = gsap.timeline({ paused: true });

        tl.from(section.querySelector('.titulo-suported'), {
          opacity: 0,
          x: -40,
          duration: 0.5
        }).from(section.querySelector('.logo-unu'), {
          opacity: 0,
          duration: 0.5
        }).from(section.querySelector('.logo-sistemas'), {
          opacity: 0,
          duration: 0.5
        })
        
        ;

        this.sectionTimelines.set(section, tl);
      }

    });



    // ESTADO INICIAL
    gsap.set(this.sections, { opacity: 0 });
    gsap.set(this.sections[0], { opacity: 1 });

    this.sectionTimelines.get(this.sections[0])?.restart();

    // SCROLL
    window.addEventListener('wheel', this.onWheel, { passive: false });
  }

  // SCROLL HANDLER
  onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.isAnimating) return;

    if (e.deltaY > 0) {
      this.goToSection(this.currentIndex + 1);
    } else {
      this.goToSection(this.currentIndex - 1);
    }
  };

  // CAMBIO DE SECCIÓN
  goToSection(index: number) {
    if (index < 0 || index >= this.sections.length) return;

    this.isAnimating = true;

    const current = this.sections[this.currentIndex];
    const next = this.sections[index];

    this.currentIndex = index;

    gsap.to(current, {
      opacity: 0,
      duration: 0.3
    });

    gsap.to(next, {
      opacity: 1,
      duration: 0.6,
      onComplete: () => {
        this.isAnimating = false;
      }
    });

    // reiniciar animación de la sección entrante
    this.sectionTimelines.get(next)?.restart();
  }

  // =========================
  // DESTROY
  // =========================
  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.onWheel);
  }
}
