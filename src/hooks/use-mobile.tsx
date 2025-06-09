
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update the state initially
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Create listener that updates the state
    const listener = () => {
      setMatches(media.matches);
    };
    
    // Set up event listener
    media.addEventListener("change", listener);
    
    // Clean up
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query, matches]);
  
  return matches;
}

/**
 * A hook that returns true if the device is a mobile device (screen width less than 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
