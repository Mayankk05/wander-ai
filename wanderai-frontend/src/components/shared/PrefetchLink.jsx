import React from 'react';
import { Link } from 'react-router-dom';
import { loaders } from '../../App';

/**
 * PrefetchLink:
 * A wrapper around react-router Link that starts loading the target component's chunk
 * when the user hovers over the link.
 */
export default function PrefetchLink({ to, loaderKey, children, className, ...props }) {
  const handleMouseEnter = () => {
    if (loaderKey && loaders[loaderKey]) {
      // Trigger the dynamic import in the background
      loaders[loaderKey]().catch(() => {}); 
    }
  };

  return (
    <Link 
      to={to} 
      className={className} 
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter} // Also prefetch on touch
      {...props}
    >
      {children}
    </Link>
  );
}
