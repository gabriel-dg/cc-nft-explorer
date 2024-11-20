import { motion, animate } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.5,
      onUpdate: (v) => setDisplayValue(Math.floor(v))
    });
    
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue}</span>;
};

export default AnimatedNumber; 