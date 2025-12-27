import { Component, AfterViewInit, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-web-main',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './web-main.component.html',
  styleUrl: './web-main.component.css'
})
export class WebMainComponent implements AfterViewInit {


  ngAfterViewInit() {


    const t = gsap.timeline();

    t.fromTo(
      ".text-present",
      {
        opacity: 0,
        x: -50,
      },
      {
        opacity: 1,
        x: 0,
        duration: 3,
        ease: "power2.out",
      }
    );
      



    gsap.utils.toArray<HTMLElement>('.float-img').forEach((el, i) => {
      const tl = gsap.timeline();

      tl.fromTo(
        el,
        {
          opacity: 0,
          x: 60 + i * 10,   // punto inicial distinto
        },
        {
          opacity: 1,
          x: 0,
          duration: 3,

          ease: 'power2.out',
          delay: i * 0.1    // entrada escalonada
        }
      );


      gsap.to(el, {
        y: i % 2 === 0 ? -30 : 30,   // distinto movimiento
        duration: 3 + i * 2,    // distinta velocidad
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5              // distinto inicio
      });

    });
  }





}
