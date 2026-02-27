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
    // Only access window on client side
    setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    if (windowDimensions.width === 0) return; // Wait until dimensions exist

    const ctx = gsap.context(() => {
      const roadWidth = windowDimensions.width;
      const carWidth = 150; // Reference uses relatively fixed car styling
      const endX = roadWidth - carWidth;

      const letters = lettersRef.current.filter((el): el is HTMLSpanElement => el !== null);

      // We must calculate exact letter offsets AFTER layout
      const valueRect = valueTextRef.current?.getBoundingClientRect();

      let letterOffsets: number[] = [];
      if (valueRect) {
        // Find offsets relative to the parent bounding box
        letterOffsets = letters.map((letter) => letter.offsetLeft);
      }

      // Animating the car and the trail/text mask
      gsap.to(carRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          pin: trackRef.current,
        },
        x: endX,
        ease: "none",
        onUpdate: function () {
          const carX = gsap.getProperty(carRef.current, "x") as number;
          const scrubberPos = carX + carWidth / 2;

          if (valueRect) {
            letters.forEach((letter, i) => {
              const letterX = valueRect.left + letterOffsets[i];
              // Exact logic from reference:
              if (scrubberPos >= letterX) {
                letter.style.opacity = '1';
              } else {
                letter.style.opacity = '0';
              }
            });
          }

          gsap.set(trailRef.current, { width: scrubberPos });
        },
      });

      // Box fade ins at specific offsets from 'section' trigger
      // Using exactly the reference start/end values
      gsap.to(box1Ref.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top+=400 top",
          end: "top+=600 top",
          scrub: true,
        },
        opacity: 1,
      });

      gsap.to(box2Ref.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top+=600 top",
          end: "top+=800 top",
          scrub: true,
        },
        opacity: 1,
      });

      gsap.to(box3Ref.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top+=800 top",
          end: "top+=1000 top",
          scrub: true,
        },
        opacity: 1,
      });

      gsap.to(box4Ref.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top+=1000 top",
          end: "top+=1200 top",
          scrub: true,
        },
        opacity: 1,
      });

    });

    return () => ctx.revert();
  }, [windowDimensions.width]); // Re-run if window completely resizes to recalculate X

  const setLetterRef = (index: number) => (el: HTMLSpanElement | null) => {
    lettersRef.current[index] = el;
  };

  const str = "WELCOME ITZFIZZ";

  return (
    <>
      <div className="h-screen flex items-center justify-center text-gray-500">
        <h1>Scroll down for exact clone...</h1>
      </div>

      <div ref={sectionRef} className="relative h-[200vh] bg-[#121212]">

        <div ref={trackRef} className="sticky top-0 h-[100vh] w-full flex items-center justify-center bg-[#d1d1d1]">

          <div className="w-full h-[200px] bg-[#1e1e1e] relative overflow-hidden flex items-center">

            {/* Downloaded original image of car */}
            <img
              ref={carRef}
              src="/car.png"
              alt="car"
              className="h-[200px] absolute top-0 left-0 z-10"
              style={{ width: 'auto' }} // Ensure natural aspect ratio
            />

            <div ref={trailRef} className="h-[200px] bg-[#45db7d] absolute top-0 left-0 z-[1] w-0"></div>

            <div
              ref={valueTextRef}
              className="absolute left-[5%] top-[15%] z-[5] flex gap-[0.3rem]"
              style={{ fontSize: '8rem', fontWeight: 'bold' }}
            >
              {str.split('').map((char, i) => (
                <span
                  key={i}
                  ref={setLetterRef(i)}
                  className="text-[#111] opacity-0 transition-opacity duration-0 whitespace-pre"
                >
                  {char}
                </span>
              ))}
            </div>

          </div>

          {/* Explicitly positioned exactly like the reference */}
          <div
            ref={box1Ref}
            className="absolute z-[5] opacity-0 flex flex-col gap-[5px] p-[30px] rounded-[10px] m-[1rem]"
            style={{ top: '5%', right: '30%', backgroundColor: '#def54f', color: '#111' }}
          >
            <span className="text-[58px] font-semibold leading-none">58%</span>
            <span className="text-[18px]">Increase in pick up point use</span>
          </div>

          <div
            ref={box2Ref}
            className="absolute z-[5] opacity-0 flex flex-col gap-[5px] p-[30px] rounded-[10px] m-[1rem]"
            style={{ bottom: '5%', right: '35%', backgroundColor: '#6ac9ff', color: '#111' }}
          >
            <span className="text-[58px] font-semibold leading-none">23%</span>
            <span className="text-[18px]">Decreased in customer phone calls</span>
          </div>

          <div
            ref={box3Ref}
            className="absolute z-[5] opacity-0 flex flex-col gap-[5px] p-[30px] rounded-[10px] m-[1rem]"
            style={{ top: '5%', right: '10%', backgroundColor: '#333', color: '#fff' }}
          >
            <span className="text-[58px] font-semibold leading-none">27%</span>
            <span className="text-[18px]">Increase in pick up point use</span>
          </div>

          <div
            ref={box4Ref}
            className="absolute z-[5] opacity-0 flex flex-col gap-[5px] p-[30px] rounded-[10px] m-[1rem]"
            style={{ bottom: '5%', right: '12.5%', backgroundColor: '#fa7328', color: '#111' }}
          >
            <span className="text-[58px] font-semibold leading-none">40%</span>
            <span className="text-[18px]">Decreased in customer phone calls</span>
          </div>

        </div>
      </div>

      <div className="h-screen bg-[#121212]"></div>
    </>
  );
}
