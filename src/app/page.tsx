"use client"

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const valueTextRef = useRef<HTMLDivElement>(null);

  const lettersRef = useRef<Array<HTMLSpanElement | null>>([]);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const box3Ref = useRef<HTMLDivElement>(null);
  const box4Ref = useRef<HTMLDivElement>(null);

  // Custom Cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  // Parallax Hero Container
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const heroGridRef = useRef<HTMLDivElement>(null);

  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Track Window Resize
  useLayoutEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom Cursor Logic & Hero Parallax
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const onMouseMove = (e: MouseEvent) => {
        // Cursor
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.6,
          ease: "power3.out"
        });
        gsap.to(cursorDotRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "none"
        });

        // Hero Parallax
        if (heroContainerRef.current && heroGridRef.current) {
          const rect = heroContainerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          gsap.to(heroGridRef.current, {
            x: x * 30, // Move grid slightly
            y: y * 30,
            rotationY: x * 10,
            rotationX: -y * 10,
            ease: "power2.out",
            duration: 1
          });
        }
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
    });
    return () => ctx.revert();
  }, []);

  // GSAP Scroll Animation
  useLayoutEffect(() => {
    if (windowDimensions.width === 0) return;

    const ctx = gsap.context(() => {
      // Pinning the main track
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: trackRef.current,
      });

      const roadWidth = windowDimensions.width;
      const carRect = carRef.current?.getBoundingClientRect();
      const carWidth = carRect ? carRect.width : 250;
      // Make the car drive completely off the right edge of the screen
      const endX = roadWidth + carWidth;

      const letters = lettersRef.current.filter((el): el is HTMLSpanElement => el !== null);
      const valueRect = valueTextRef.current?.getBoundingClientRect();

      // Ensure letters are absolutely positioned relative to the centered container
      // and pre-calculate their offset positions.
      const letterOffsets: number[] = [];
      if (valueRect) {
        letters.forEach((letter) => {
          gsap.set(letter, { position: 'relative' }); // Changed to relative for flex flow
          // Calculate offset relative to the container for correct timing
          const letterRect = letter.getBoundingClientRect();
          letterOffsets.push(letterRect.left - valueRect.left);
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        }
      });

      // 1. Car moves across the screen
      tl.to(carRef.current, {
        x: endX,
        ease: "power2.inOut",
        onUpdate: function () {
          const carX = gsap.getProperty(carRef.current, "x") as number;
          const scrubberPos = carX + carWidth * 0.4; // Trail ends near middle of car

          if (valueRect) {
            letters.forEach((letter, i) => {
              const letterX = valueRect.left + letterOffsets[i];
              // As the car trail crosses each letter's X position, reveal the letter
              if (scrubberPos >= letterX) {
                gsap.to(letter, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  duration: 0.3,
                  overwrite: 'auto'
                });
              } else {
                gsap.to(letter, {
                  opacity: 0,
                  y: 40,
                  scale: 0.8,
                  filter: 'blur(10px)',
                  duration: 0.3,
                  overwrite: 'auto'
                });
              }
            });
          }

          gsap.set(trailRef.current, { width: scrubberPos });
        },
      }, 0);

      // Explosion of cards
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top", // Explode right alongside the car's movement
          end: "bottom bottom",
          scrub: true,
        }
      });

      // Reset cards to center behind the path
      gsap.set([box1Ref.current, box2Ref.current, box3Ref.current, box4Ref.current], {
        xPercent: -50,
        yPercent: -50,
        left: "50%",
        top: "50%",
        scale: 0.2,
        opacity: 0,
        rotation: () => gsap.utils.random(-15, 15)
      });

      // Animate explosion to the four corners
      tl2.to([box1Ref.current, box2Ref.current, box3Ref.current, box4Ref.current], {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 2,
        ease: "power3.out"
      }, 0);

      tl2.to(box1Ref.current, { top: "20%", left: "15%", duration: 2, ease: "power3.out" }, 0);
      tl2.to(box2Ref.current, { top: "20%", left: "85%", duration: 2, ease: "power3.out" }, 0);
      tl2.to(box3Ref.current, { top: "80%", left: "15%", duration: 2, ease: "power3.out" }, 0);
      tl2.to(box4Ref.current, { top: "80%", left: "85%", duration: 2, ease: "power3.out" }, 0);

      // Initial Hero Load Animations
      const heroTl = gsap.timeline();
      heroTl.from(".hero-headline", {
        y: 60,
        opacity: 0,
        filter: "blur(10px)",
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        delay: 0.2
      });
      heroTl.from(".hero-subtitle", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.5");
      heroTl.from(".hero-scroll", {
        opacity: 0,
        duration: 1,
      }, "-=0.3");

    });

    return () => ctx.revert();
  }, [windowDimensions.width]);

  const setLetterRef = (index: number) => (el: HTMLSpanElement | null) => {
    lettersRef.current[index] = el;
  };

  // 3D Tilt Hover Effect for Cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -15; // Max 15 degree tilt
    const tiltY = ((x - centerX) / centerX) * 15;

    gsap.to(ref.current, {
      duration: 0.3,
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 1000,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      duration: 0.7,
      rotateX: 0,
      rotateY: 0,
      ease: "elastic.out(1, 0.3)",
    });
  };

  const str = "WELCOME TO ITZFIZZ";

  return (
    <>
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-10 h-10 border border-[#0ff] rounded-full pointer-events-none z-[9999] opacity-0 md:opacity-100 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
      ></div>
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#0ff] rounded-full pointer-events-none z-[10000] opacity-0 md:opacity-100 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#0ff]"
      ></div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-4 flex justify-between items-center backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2" onMouseEnter={() => gsap.to(cursorRef.current, { scale: 1.5, borderColor: '#fff' })} onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, borderColor: '#0ff' })}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ff] to-[#00f] flex items-center justify-center font-black text-white p-1">V</div>
          <span className="text-xl font-bold tracking-tighter text-white">VELOCITY</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onMouseEnter={() => gsap.to(cursorRef.current, { scale: 1.5, borderColor: '#fff' })} onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, borderColor: '#0ff' })}>MODELS</a>
          <a href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onMouseEnter={() => gsap.to(cursorRef.current, { scale: 1.5, borderColor: '#fff' })} onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, borderColor: '#0ff' })}>TECHNOLOGY</a>
          <a href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onMouseEnter={() => gsap.to(cursorRef.current, { scale: 1.5, borderColor: '#fff' })} onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, borderColor: '#0ff' })}>MAPPING</a>
          <a href="#" className="text-sm font-medium text-white/70 hover:text-white transition-colors" onMouseEnter={() => gsap.to(cursorRef.current, { scale: 1.5, borderColor: '#fff' })} onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, borderColor: '#0ff' })}>SUPPORT</a>
        </div>
        <button className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-[#0ff] transition-colors" onMouseEnter={() => gsap.to(cursorRef.current, { scale: 1.5, borderColor: '#fff' })} onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, borderColor: '#0ff' })}>
          RESERVE NOW
        </button>
      </nav>

      {/* Intro Hero Section */}
      <div ref={heroContainerRef} className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] relative z-10 overflow-hidden" style={{ perspective: '1000px' }}>

        {/* Animated Cyber Grid (Now with Parallax Ref) */}
        <div ref={heroGridRef} className="absolute inset-[-100%] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_40%_40%_at_50%_50%,#000_10%,transparent_100%)]"></div>

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,180,255,0.1)_0,transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,0,128,0.1)_0,transparent_40%)]"></div>

        <h1 className="hero-headline text-7xl md:text-9xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-800 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10 uppercase">
          Velocity
        </h1>
        <p className="hero-subtitle text-gray-400 text-lg md:text-xl tracking-[0.3em] uppercase mb-16 font-semibold relative z-10">
          Enter The Fast Lane
        </p>

        {/* Scroll Indicator */}
        <div className="hero-scroll flex flex-col items-center gap-3 relative z-10 opacity-70">
          <div className="w-[1px] h-[60px] bg-gradient-to-b from-transparent via-white to-transparent animate-pulse delay-75"></div>
          <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/50">Scroll</span>
        </div>
      </div>

      <div ref={sectionRef} className="relative h-[250vh] bg-[#020202]">
        <div ref={trackRef} className="h-screen w-full flex flex-col items-center justify-center bg-transparent overflow-hidden relative">

          {/* Main Road/Track Container */}
          <div className="w-full h-[400px] bg-gradient-to-b from-[#000] via-[#050505] to-[#000] relative flex items-center border-y border-white/5 z-[2] shadow-[0_0_100px_rgba(0,0,0,1)]">

            {/* Speed Lines Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiIC8+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHRlcm4iIHdpZHRoPSI0MCIgaGVpZ2h0PSI0IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAxKSIgLz48L3BhdHRlcm4+PC9kZWZzPjwvc3ZnPg==')] opacity-50"></div>

            {/* Glowing Trail Behind Car */}
            <div
              ref={trailRef}
              className="h-full absolute top-0 left-0 z-[1] w-0 bg-[linear-gradient(90deg,transparent,rgba(0,255,255,0.1)_50%,rgba(0,255,255,0.3)_100%)] mix-blend-screen transition-all"
              style={{ borderRight: '1px solid #0ff', boxShadow: '20px 0 60px -10px #0ff' }}
            ></div>

            {/* Premium Text Masked by Car */}
            <div
              ref={valueTextRef}
              className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 z-[5] flex gap-[1rem] select-none w-max"
              style={{ fontSize: '6vw', fontWeight: '900', letterSpacing: '-0.02em', height: 'auto', display: 'flex', alignItems: 'center' }}
            >
              {"WELCOME TO ITZFIZZ".split('').map((char, i) => (
                <span
                  key={i}
                  ref={setLetterRef(i)}
                  className="text-white opacity-0 blur-[10px] translate-y-[40px] scale-[0.8] whitespace-pre"
                  style={{ textShadow: '0 0 40px rgba(255,255,255,0.4)', minWidth: char === ' ' ? '1.5vw' : 'auto' }}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* Updated Car Image Wrapper - Flex Center */}
            <div
              ref={carRef}
              className="absolute left-0 top-0 h-full flex items-center z-10 will-change-transform"
            >
              <img
                src="/sports-car.png"
                alt="Premium Sports Car"
                className="object-contain drop-shadow-[50px_20px_30px_rgba(0,0,0,0.9)] scale-110"
                style={{ height: '220px', width: 'auto' }}
              />
            </div>
          </div>

          {/* Background Ambient Glow around Track */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[600px] bg-[#00e5ff]/5 blur-[200px] rounded-full pointer-events-none z-[0] mix-blend-screen"></div>

          {/* Four Pop-out Info Cards */}
          <div ref={box1Ref} className="card-corner border-t-[#00f3ff]/30 group transition-transform duration-200 ease-out" onMouseMove={(e) => handleMouseMove(e, box1Ref)} onMouseLeave={(e) => handleMouseLeave(e, box1Ref)}>
            <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-b from-[#00f3ff]/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#00f3ff]/10 text-[#00f3ff] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(0,243,255,0.2)] border border-[#00f3ff]/30 relative mix-blend-screen group-hover:scale-110 transition-transform">1</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">58<span className="text-3xl text-[#00f3ff]">%</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">Performance Boost</span>
          </div>

          <div ref={box2Ref} className="card-corner border-t-[#fc4a1a]/30 group transition-transform duration-200 ease-out" onMouseMove={(e) => handleMouseMove(e, box2Ref)} onMouseLeave={(e) => handleMouseLeave(e, box2Ref)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#fc4a1a]/10 text-[#fc4a1a] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(252,74,26,0.2)] border border-[#fc4a1a]/30 relative mix-blend-screen group-hover:scale-110 transition-transform">2</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">2.4<span className="text-3xl text-[#fc4a1a]">s</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">0-60 Mph Acceleration</span>
          </div>

          <div ref={box3Ref} className="card-corner border-t-[#11998e]/30 group transition-transform duration-200 ease-out" onMouseMove={(e) => handleMouseMove(e, box3Ref)} onMouseLeave={(e) => handleMouseLeave(e, box3Ref)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#11998e]/10 text-[#11998e] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(17,153,142,0.2)] border border-[#11998e]/30 relative mix-blend-screen group-hover:scale-110 transition-transform">3</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">99<span className="text-3xl text-[#11998e]">%</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">Aerodynamic Efficiency</span>
          </div>

          <div ref={box4Ref} className="card-corner border-t-[#b224ef]/30 group transition-transform duration-200 ease-out" onMouseMove={(e) => handleMouseMove(e, box4Ref)} onMouseLeave={(e) => handleMouseLeave(e, box4Ref)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#b224ef]/10 text-[#b224ef] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(178,36,239,0.2)] border border-[#b224ef]/30 relative mix-blend-screen group-hover:scale-110 transition-transform">4</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">12<span className="text-3xl text-[#b224ef]">k</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">Max RPM Power</span>
          </div>

        </div>
      </div>

      <div className="h-[70vh] bg-[#020202] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.03)_0,transparent_70%)]"></div>
        <h2 className="text-4xl md:text-6xl font-black text-white/90 uppercase tracking-[0.1em] relative z-10 mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          Experience Velocity
        </h2>
        <p className="text-gray-400 text-sm md:text-md tracking-[0.2em] uppercase mb-10 font-medium relative z-10 max-w-xl text-center px-4">
          Reserve your model today and join the elite future of aerodynamics.
        </p>

        <button className="relative px-8 py-4 bg-transparent border border-[#0ff] text-[#0ff] font-bold uppercase tracking-widest text-sm hover:bg-[#0ff] hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] z-10" onMouseEnter={() => gsap.to(cursorRef.current, { scale: 1.5, borderColor: '#fff' })} onMouseLeave={() => gsap.to(cursorRef.current, { scale: 1, borderColor: '#0ff' })}>
          Configure Yours
        </button>

        {/* Footer Links */}
        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row justify-between items-center border-t border-white/5 bg-black/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0ff] to-[#00f] flex items-center justify-center font-black text-white p-[2px] text-[10px]">V</div>
            <span className="text-sm font-bold tracking-tighter text-white">VELOCITY MOTORS</span>
          </div>

          <div className="flex gap-6 text-xs font-semibold tracking-widest text-gray-500 uppercase">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="https://github.com/paraschaturvedi/car-scroll-animation" target="_blank" rel="noreferrer" className="hover:text-[#0ff] transition-colors">Original Ref</a>
          </div>
        </div>
      </div>
    </>
  );
}
