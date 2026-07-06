import { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';

export function SplineWrapper() {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  
  // Use a ref to store tracking state to avoid closure issues
  const trackRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    rAF: null
  });

  useEffect(() => {
    // Hack to force transparent background in WebGL
    const originalClearColor2 = WebGL2RenderingContext.prototype.clearColor;
    WebGL2RenderingContext.prototype.clearColor = function (r, g, b, a) {
      originalClearColor2.call(this, r, g, b, 0);
    };
    const originalClearColor1 = WebGLRenderingContext.prototype.clearColor;
    WebGLRenderingContext.prototype.clearColor = function (r, g, b, a) {
      originalClearColor1.call(this, r, g, b, 0);
    };

    const container = containerRef.current;
    let handleWheel;
    if (container) {
      // Prevent zooming (wheel scroll)
      handleWheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
      container.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    }

    const handleMouseMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
      
      // Target rotation offset (radians)
      trackRef.current.targetX = Math.max(-1, Math.min(1, x)) * 0.3; 
      trackRef.current.targetY = Math.max(-1, Math.min(1, y)) * 0.15;
    };
    
    // We will use Spline's internal update event instead of rAF to avoid animation conflicts
    const loop = () => {
      trackRef.current.currentX += (trackRef.current.targetX - trackRef.current.currentX) * 0.1;
      trackRef.current.currentY += (trackRef.current.targetY - trackRef.current.currentY) * 0.1;
      trackRef.current.rAF = requestAnimationFrame(loop);
    };
    trackRef.current.rAF = requestAnimationFrame(loop);
    
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(trackRef.current.rAF);
      WebGL2RenderingContext.prototype.clearColor = originalClearColor2;
      WebGLRenderingContext.prototype.clearColor = originalClearColor1;
      window.removeEventListener('mousemove', handleMouseMove);
      if (container && handleWheel) {
        container.removeEventListener('wheel', handleWheel, { capture: true });
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative pointer-events-auto overflow-visible cursor-crosshair"
    >
      <Spline 
        scene="/scene.splinecode" 
        onLoad={(app) => {
          appRef.current = app;
          try { if (app._scene) app._scene.background = null; } catch(e) {}
          try { app.setBackgroundColor('transparent'); } catch(e) {}
          
          // Shrink the model inside the frame (user asked for slight shrink)
          try {
            app.setZoom(0.3); // decreased by another 30% from 0.45
          } catch(e) {}
          
          // Hide the white floor/rectangle object
          try {
            const floor = app.findObjectByName('Floor');
            if (floor) floor.visible = false;
            
            const rect = app.findObjectByName('Rectangle');
            if (rect && rect.name.includes('Rectangle')) rect.visible = false;
          } catch(e) {}
          // Hook into Spline's update event to apply passive rotation AFTER animations
          let robotRoot = null;
          app.addEventListener('update', () => {
             if (!robotRoot && app._scene && app._scene.children) {
                 robotRoot = app._scene.children.find(c => {
                     const n = (c.name || '').toLowerCase();
                     return c.type !== 'Camera' && !n.includes('light') && n !== 'floor' && !n.includes('rectangle');
                 });
             }
             if (robotRoot && robotRoot.rotation) {
                 // Add our parallax offset to whatever rotation the animation set this frame
                 robotRoot.rotation.y += trackRef.current.currentX;
                 robotRoot.rotation.x += trackRef.current.currentY;
             }
          });
        }}
      />
    </div>
  );
}
