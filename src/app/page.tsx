"use client"

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const valueTextRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const lettersRef = useRef<Array<HTMLSpanElement | null>>([]);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const box3Ref = useRef<HTMLDivElement>(null);
  const box4Ref = useRef<HTMLDivElement>(null);

  // Custom Cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  // SSR-safe: initialize to 0, set in useEffect
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Custom Cursor Logic
  useEffect(() => {
    if (!isClient) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power3.out"
      });
      gsap.to(cursorDotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "none"
      });
    };

    const onMouseDown = () => {
      gsap.to(cursorRef.current, { scale: 0.8, duration: 0.2 });
    };
    const onMouseUp = () => {
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.3)" });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isClient]);

  // GSAP Scroll Animation - Core
  useEffect(() => {
    if (!isClient) return;

    // Small delay to ensure DOM is fully rendered and measured
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const car = carRef.current;
        const trail = trailRef.current;
        const section = sectionRef.current;
        const track = trackRef.current;
        const progressBar = progressBarRef.current;
        const letters = lettersRef.current.filter((el): el is HTMLSpanElement => el !== null);
        const valueRect = valueTextRef.current?.getBoundingClientRect();

        if (!car || !trail || !section || !track) return;

        const letterOffsets: number[] = [];
        if (valueRect) {
          letters.forEach((letter) => {
            const letterRect = letter.getBoundingClientRect();
            letterOffsets.push(letterRect.left - valueRect.left);
          });
        }

        const roadWidth = window.innerWidth;
        const carWidth = car.getBoundingClientRect().width || 150;
        const endX = roadWidth + carWidth; // Car fully disappears off the right edge

        // Stat boxes — initial hidden state
        gsap.set([box1Ref.current, box2Ref.current, box3Ref.current, box4Ref.current], {
          opacity: 0,
          y: 60,
          scale: 0.85,
        });

        // ─── CAR MOVEMENT (matching reference exactly) ───
        // Reference: gsap.to(car, { scrollTrigger: {trigger:".section", start:"top top", end:"bottom top", scrub:true, pin:".track"}, x: endX, ease:"none", onUpdate... })
        gsap.to(car, {
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
            pin: track,
            onUpdate: (self) => {
              if (progressBar) {
                gsap.set(progressBar, { scaleX: self.progress });
              }
            }
          },
          x: endX,
          ease: "none",
          onUpdate: function () {
            const carX = (gsap.getProperty(car, "x") as number) + carWidth / 2;

            // Letter reveal
            if (valueRect) {
              letters.forEach((letter, i) => {
                const letterX = valueRect.left + letterOffsets[i];
                if (carX >= letterX) {
                  letter.style.opacity = "1";
                } else {
                  letter.style.opacity = "0";
                }
              });
            }

            // Trail follows the car
            gsap.set(trail, { width: carX });
          },
        });

        // ─── STAT BOXES (separate ScrollTriggers, pixel-based, matching reference) ───
        gsap.to(box1Ref.current, {
          scrollTrigger: {
            trigger: section,
            start: "top+=400 top",
            end: "top+=600 top",
            scrub: true,
          },
          opacity: 1, y: 0, scale: 1,
        });

        gsap.to(box2Ref.current, {
          scrollTrigger: {
            trigger: section,
            start: "top+=600 top",
            end: "top+=800 top",
            scrub: true,
          },
          opacity: 1, y: 0, scale: 1,
        });

        gsap.to(box3Ref.current, {
          scrollTrigger: {
            trigger: section,
            start: "top+=800 top",
            end: "top+=1000 top",
            scrub: true,
          },
          opacity: 1, y: 0, scale: 1,
        });

        gsap.to(box4Ref.current, {
          scrollTrigger: {
            trigger: section,
            start: "top+=1000 top",
            end: "top+=1200 top",
            scrub: true,
          },
          opacity: 1, y: 0, scale: 1,
        });

        // ─── Hero Intro Animations (time-based, on page load) ───
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        heroTl.from(".hero-title span", {
          y: 80,
          opacity: 0,
          filter: "blur(8px)",
          stagger: 0.04,
          duration: 0.7,
          delay: 0.3,
        });
        heroTl.from(".hero-stats .stat-item", {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.5,
          ease: "power2.out",
        }, "-=0.3");
        heroTl.from(".hero-scroll-indicator", {
          opacity: 0,
          y: 20,
          duration: 0.6,
        }, "-=0.2");

        // Refresh ScrollTrigger after all setup
        ScrollTrigger.refresh();
      });

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [isClient]);

  const setLetterRef = (index: number) => (el: HTMLSpanElement | null) => {
    lettersRef.current[index] = el;
  };

  const heroText = "W E L C O M E   I T Z F I Z Z";

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div ref={progressBarRef} className="scroll-progress-bar"></div>
      </div>

      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor"></div>
      <div ref={cursorDotRef} className="custom-cursor-dot"></div>

      {/* ─── HERO SECTION (Above the Fold) ─── */}
      <section className="hero-section">
        {/* Ambient background glow */}
        <div className="hero-bg-glow"></div>

        {/* Animated Grid */}
        <div className="hero-grid"></div>

        {/* Particle dots — deterministic positions to avoid hydration mismatch */}
        <div className="hero-particles">
          {[
            { l: 12, t: 8, d: 0, du: 4 }, { l: 85, t: 15, d: 1.2, du: 5.5 },
            { l: 35, t: 72, d: 2.4, du: 3.8 }, { l: 68, t: 45, d: 0.8, du: 6 },
            { l: 5, t: 55, d: 3.1, du: 4.2 }, { l: 92, t: 82, d: 1.6, du: 5 },
            { l: 48, t: 20, d: 4.0, du: 3.5 }, { l: 22, t: 90, d: 0.4, du: 6.5 },
            { l: 75, t: 35, d: 2.8, du: 4.8 }, { l: 55, t: 65, d: 3.6, du: 5.2 },
            { l: 8, t: 30, d: 1.0, du: 4.5 }, { l: 62, t: 88, d: 2.0, du: 3.2 },
            { l: 42, t: 12, d: 4.5, du: 5.8 }, { l: 88, t: 52, d: 0.6, du: 6.2 },
            { l: 18, t: 42, d: 3.4, du: 4.0 }, { l: 78, t: 78, d: 1.8, du: 3.6 },
            { l: 30, t: 58, d: 2.6, du: 5.4 }, { l: 95, t: 25, d: 4.2, du: 4.4 },
            { l: 52, t: 95, d: 0.2, du: 6.8 }, { l: 15, t: 68, d: 3.8, du: 3.4 },
          ].map((p, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${p.l}%`,
                top: `${p.t}%`,
                animationDelay: `${p.d}s`,
                animationDuration: `${p.du}s`,
              }}
            />
          ))}
        </div>

        {/* Nav */}
        <nav className="hero-nav">
          <div className="nav-brand">
            <div className="nav-logo">V</div>
            <span className="nav-title">VELOCITY</span>
          </div>
          <div className="nav-links">
            <a href="#">Models</a>
            <a href="#">Technology</a>
            <a href="#">Mapping</a>
            <a href="#">Support</a>
          </div>
          <button className="nav-cta magnetic-btn">Reserve Now</button>
        </nav>

        {/* Hero Headline — letter-spaced, staggered reveal */}
        <div className="hero-content">
          <div className="hero-subtitle">NEXT-GEN PERFORMANCE</div>
          <h1 className="hero-title">
            {heroText.split('').map((char, i) => (
              <span key={i} style={{ display: 'inline-block', minWidth: char === ' ' ? '0.5em' : 'auto' }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>

          {/* Impact Metrics / Statistics */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">58%</span>
              <span className="stat-label">Higher Peak Performance</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">23%</span>
              <span className="stat-label">Faster Acceleration Velocity</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">27%</span>
              <span className="stat-label">Improved Aero Efficiency</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">40%</span>
              <span className="stat-label">Better Downforce Control</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </section>

      {/* ─── SCROLL ANIMATION SECTION ─── */}
      <div ref={sectionRef} className="scroll-section">
        <div ref={trackRef} className="track">
          {/* Road */}
          <div className="road" id="road">
            {/* Lane markings */}
            <div className="road-lane-top"></div>
            <div className="road-lane-center"></div>
            <div className="road-lane-bottom"></div>

            {/* Green Trail */}
            <div ref={trailRef} className="trail"></div>

            {/* Car */}
            <img
              ref={carRef}
              src="/car.png"
              alt="car"
              className="car"
            />

            {/* Letter Reveal Text */}
            <div ref={valueTextRef} className="value-text">
              {"WELCOME ITZFIZZ".split('').map((char, i) => (
                <span
                  key={i}
                  ref={setLetterRef(i)}
                  className="value-letter"
                  style={{ minWidth: char === ' ' ? '0.8em' : 'auto' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          </div>

          {/* Stat Boxes (positioned absolutely over the track) */}
          <div ref={box1Ref} className="text-box box-yellow" style={{ top: '5%', right: '30%' }}>
            <span className="num-box">58%</span>
            <span className="box-desc">Increase in pick up point use</span>
          </div>
          <div ref={box2Ref} className="text-box box-blue" style={{ bottom: '5%', right: '35%' }}>
            <span className="num-box">23%</span>
            <span className="box-desc">Decreased in customer phone calls</span>
          </div>
          <div ref={box3Ref} className="text-box box-dark" style={{ top: '5%', right: '10%' }}>
            <span className="num-box">27%</span>
            <span className="box-desc">Increase in pick up point use</span>
          </div>
          <div ref={box4Ref} className="text-box box-orange" style={{ bottom: '5%', right: '12.5%' }}>
            <span className="num-box">40%</span>
            <span className="box-desc">Decreased in customer phone calls</span>
          </div>
        </div>
      </div>

      {/* ─── FOOTER SECTION ─── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">V</div>
            <span>VELOCITY MOTORS</span>
          </div>
          <p className="footer-tagline">Reserve your model today and join the elite future of aerodynamics.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
            <a href="https://paraschaturvedi.github.io/car-scroll-animation" target="_blank" rel="noreferrer">Original Ref</a>
          </div>
          <p className="footer-copy">&copy; 2026 Velocity Motors. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
