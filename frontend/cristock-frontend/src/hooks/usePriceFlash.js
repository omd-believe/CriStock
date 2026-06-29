import { useState, useEffect, useRef } from 'react';

export default function usePriceFlash(price) {
  const [flashClass, setFlashClass] = useState('');
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price > prevPriceRef.current) {
      setFlashClass('animate-price-up');
    } else if (price < prevPriceRef.current) {
      setFlashClass('animate-price-down');
    }

    prevPriceRef.current = price;

    const timer = setTimeout(() => {
      setFlashClass('');
    }, 600);

    return () => clearTimeout(timer);
  }, [price]);

  return flashClass;
}