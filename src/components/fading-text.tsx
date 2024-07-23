import React, { useState, useEffect } from "react";
import "./fading-text.css"

export const FadingText: React.FC<{ strings: string[] }> = ({ strings }) => {
    const [currentStringIndex, setCurrentStringIndex] = useState(0);
    const [fadeState, setFadeState] = useState<'fading-out' | 'fading-in'>(
      'fading-in'
    );
  
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (currentStringIndex !== strings.length - 1) {
          setFadeState('fading-out');
        }
      }, 3000); // Change the duration as needed
  
      return () => clearTimeout(timeoutId);
    }, [currentStringIndex]);
  
    useEffect(() => {
      if (
        fadeState === 'fading-out' &&
        currentStringIndex !== strings.length - 1
      ) {
        const timeoutId = setTimeout(() => {
          setCurrentStringIndex((prevIndex) => (prevIndex + 1) % strings.length);
          setFadeState('fading-in');
        }, 1000); // Adjust the delay before fading in the next string
  
        return () => clearTimeout(timeoutId);
      }
    }, [fadeState, strings.length]);
  
    return (
      <div
        className={`fading-text ${
          fadeState === 'fading-out' ? 'fade-out' : 'fade-in'
        }`}
      >
        {strings[currentStringIndex]}
      </div>
    );
  };