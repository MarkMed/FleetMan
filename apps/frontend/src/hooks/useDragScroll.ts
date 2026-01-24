import { useCallback, useRef, RefObject } from 'react';

/**
 * useDragScroll - Custom hook for drag-to-scroll functionality
 * 
 * Permite arrastrar un elemento horizontalmente para hacer scroll,
 * simulando el comportamiento de scroll en mobile/touch devices.
 * 
 * Features:
 * - Drag horizontal con mouse
 * - Cursor cambia a 'grabbing' durante drag
 * - Previene selección de texto durante drag
 * - Smooth scrolling con inercia calculada
 * - Compatible con scroll vertical mediante rueda del ratón
 * 
 * @returns RefObject<HTMLDivElement> - Ref para aplicar al elemento scrollable
 * 
 * @example
 * const scrollRef = useDragScroll();
 * 
 * return (
 *   <div ref={scrollRef} className="overflow-x-auto">
 *     {items.map(item => <div key={item.id}>{item.name}</div>)}
 *   </div>
 * );
 */
export const useDragScroll = <T extends HTMLElement = HTMLDivElement>(): ((node: T | null) => void) => {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Callback ref que se ejecuta cuando el elemento se monta
  const ref = useCallback((element: T | null) => {
    // Limpiar listeners del elemento anterior si existen
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!element) return;

    // Handler: Mouse down - Iniciar drag
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startX.current = e.pageX - element.offsetLeft;
      scrollLeft.current = element.scrollLeft;
      
      // Cambiar cursor y prevenir selección de texto
      element.style.cursor = 'grabbing';
      element.style.userSelect = 'none';
    };

    // Handler: Mouse move - Realizar scroll durante drag
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      e.preventDefault();
      
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX.current) * 2; // Multiplicador para velocidad de scroll
      element.scrollLeft = scrollLeft.current - walk;
    };

    // Handler: Mouse up/leave - Finalizar drag
    const handleMouseUp = () => {
      isDragging.current = false;
      element.style.cursor = 'grab';
      element.style.userSelect = '';
    };

    // Attach event listeners
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseUp);

    // Initial cursor style
    element.style.cursor = 'grab';

    // Guardar función de cleanup
    cleanupRef.current = () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseUp);
      element.style.cursor = '';
      element.style.userSelect = '';
    };
  }, []);

  return ref;
};

/**
 * Future Enhancement: Touch support
 * 
 * Para soporte completo de touch devices (tablets, móviles):
 * 
 * const handleTouchStart = (e: TouchEvent) => {
 *   isDragging.current = true;
 *   startX.current = e.touches[0].pageX - element.offsetLeft;
 *   scrollLeft.current = element.scrollLeft;
 * };
 * 
 * const handleTouchMove = (e: TouchEvent) => {
 *   if (!isDragging.current) return;
 *   const x = e.touches[0].pageX - element.offsetLeft;
 *   const walk = (x - startX.current) * 2;
 *   element.scrollLeft = scrollLeft.current - walk;
 * };
 * 
 * element.addEventListener('touchstart', handleTouchStart);
 * element.addEventListener('touchmove', handleTouchMove);
 * element.addEventListener('touchend', handleMouseUp);
 */

/**
 * Future Enhancement: Inertia/Momentum scrolling
 * 
 * Para scroll con inercia (como iOS):
 * 
 * const velocity = useRef(0);
 * const lastMove = useRef(0);
 * 
 * const handleMouseMove = (e: MouseEvent) => {
 *   const now = Date.now();
 *   const delta = now - lastMove.current;
 *   velocity.current = walk / delta;
 *   lastMove.current = now;
 * };
 * 
 * const handleMouseUp = () => {
 *   // Apply momentum
 *   let remaining = velocity.current * 100;
 *   const deceleration = 0.95;
 *   
 *   const animate = () => {
 *     remaining *= deceleration;
 *     element.scrollLeft += remaining;
 *     if (Math.abs(remaining) > 0.5) requestAnimationFrame(animate);
 *   };
 *   
 *   animate();
 * };
 */

/**
 * Alternative: uso con parámetros opcionales
 * 
 * export const useDragScroll = (options?: {
 *   speed?: number;        // Multiplicador de velocidad (default: 2)
 *   axis?: 'x' | 'y' | 'both'; // Eje de scroll (default: 'x')
 *   disableOnTouch?: boolean;  // Deshabilitar en touch devices (default: false)
 * }): RefObject<HTMLDivElement> => { ... }
 */
