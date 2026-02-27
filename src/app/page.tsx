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

  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const box3Ref = useRef<HTMLDivElement>(null);
  const box4Ref = useRef<HTMLDivElement>(null);

  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    if (windowDimensions.width === 0) return;

    const ctx = gsap.context(() => {
      const roadWidth = windowDimensions.width;
      const carRect = carRef.current?.getBoundingClientRect();
      const carWidth = carRect ? carRect.width : 250;
      // Make the car drive completely off the right edge of the screen
      const endX = roadWidth + carWidth;

      const letters = lettersRef.current.filter((el): el is HTMLSpanElement => el !== null);
      const valueRect = valueTextRef.current?.getBoundingClientRect();

      let letterOffsets: number[] = [];
      if (valueRect) {
        letterOffsets = letters.map((letter) => letter.offsetLeft);
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          pin: trackRef.current,
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
          start: "center center",
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

  const str = "WELCOME ITZFIZZ";

  return (
    <>
      {/* Intro Hero Section */}
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] relative z-10 overflow-hidden">

        {/* Animated Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

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
          <div ref={box1Ref} className="card-corner border-t-[#00f3ff]/30">
            <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-b from-[#00f3ff]/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none hover:opacity-100"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#00f3ff]/10 text-[#00f3ff] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(0,243,255,0.2)] border border-[#00f3ff]/30 relative mix-blend-screen">1</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">58<span className="text-3xl text-[#00f3ff]">%</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">Performance Boost</span>
          </div>

          <div ref={box2Ref} className="card-corner border-t-[#fc4a1a]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#fc4a1a]/10 text-[#fc4a1a] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(252,74,26,0.2)] border border-[#fc4a1a]/30 relative mix-blend-screen">2</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">2.4<span className="text-3xl text-[#fc4a1a]">s</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">0-60 Mph Acceleration</span>
          </div>

          <div ref={box3Ref} className="card-corner border-t-[#11998e]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#11998e]/10 text-[#11998e] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(17,153,142,0.2)] border border-[#11998e]/30 relative mix-blend-screen">3</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">99<span className="text-3xl text-[#11998e]">%</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">Aerodynamic Efficiency</span>
          </div>

          <div ref={box4Ref} className="card-corner border-t-[#b224ef]/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#b224ef]/10 text-[#b224ef] flex items-center justify-center font-black text-2xl shadow-[0_0_30px_rgba(178,36,239,0.2)] border border-[#b224ef]/30 relative mix-blend-screen">4</div>
              <span className="text-[64px] font-black tracking-tighter text-white/90 drop-shadow-xl font-mono leading-none">12<span className="text-3xl text-[#b224ef]">k</span></span>
            </div>
            <span className="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">Max RPM Power</span>
          </div>

        </div>
      </div>

      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_70%)]"></div>
        <h2 className="text-3xl md:text-5xl font-black text-white/20 uppercase tracking-[0.2em] relative z-10">End of track</h2>
        <div className="w-[100px] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-8"></div>
      </div>
    </>
  );
}
