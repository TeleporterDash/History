<script context="module" lang="ts">
 export type SliderProps = {
   value?: number[];
   defaultValue?: number[];
   min?: number;
   max?: number;
   step?: number;
   disabled?: boolean;
   orientation?: 'horizontal' | 'vertical';
   className?: string;
 };
</script>

<script lang="ts">
 import { createEventDispatcher, onMount } from "svelte";

 export let value: number[] = [0];
 export let defaultValue: number[] = [0];
 export let min: number = 0;
 export let max: number = 100;
 export let step: number = 1;
 export let disabled: boolean = false;
 export let orientation: 'horizontal' | 'vertical' = 'horizontal';
 export let className: string = "";

 const dispatch = createEventDispatcher();

 let sliderElement: HTMLDivElement;
 let isDragging: boolean = false;
 let activeThumb: number = -1;

 // Initialize value from defaultValue if not provided
 $: if (value.length === 0 && defaultValue.length > 0) {
   value = [...defaultValue];
 }

 $: isRange = value.length > 1;

 function getPercentage(val: number): number {
   return ((val - min) / (max - min)) * 100;
 }

 function getValue(percentage: number): number {
   const val = min + (percentage / 100) * (max - min);
   return Math.round(val / step) * step;
 }

 function getMousePosition(event: MouseEvent | TouchEvent): number {
   const rect = sliderElement.getBoundingClientRect();
   const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
   
   if (orientation === 'horizontal') {
     return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
   } else {
     return Math.max(0, Math.min(100, (1 - (clientX - rect.top) / rect.height) * 100));
   }
 }

 function findClosestThumb(percentage: number): number {
   if (!isRange) return 0;
   
   const distances = value.map((val, index) => ({
     index,
     distance: Math.abs(getPercentage(val) - percentage)
   }));
   
   return distances.reduce((closest, current) => 
     current.distance < closest.distance ? current : closest
   ).index;
 }

 function updateValue(thumbIndex: number, newValue: number) {
   const newValues = [...value];
   newValues[thumbIndex] = Math.max(min, Math.min(max, newValue));
   
   // Ensure thumbs don't cross over
   if (isRange) {
     if (thumbIndex === 0 && newValues[0] > newValues[1]) {
       newValues[0] = newValues[1];
     } else if (thumbIndex === 1 && newValues[1] < newValues[0]) {
       newValues[1] = newValues[0];
     }
   }
   
   value = newValues;
   dispatch("valueChange", value);
 }

 function handleMouseDown(event: MouseEvent) {
   if (disabled) return;
   
   event.preventDefault();
   const percentage = getMousePosition(event);
   const newValue = getValue(percentage);
   
   activeThumb = findClosestThumb(percentage);
   updateValue(activeThumb, newValue);
   
   isDragging = true;
 }

 function handleMouseMove(event: MouseEvent) {
   if (!isDragging || activeThumb === -1 || disabled) return;
   
   event.preventDefault();
   const percentage = getMousePosition(event);
   const newValue = getValue(percentage);
   
   updateValue(activeThumb, newValue);
 }

 function handleMouseUp() {
   isDragging = false;
   activeThumb = -1;
 }

 function handleKeyDown(event: KeyboardEvent, thumbIndex: number) {
   if (disabled) return;
   
   let newValue = value[thumbIndex];
   
   switch (event.key) {
     case "ArrowRight":
     case "ArrowUp":
       event.preventDefault();
       newValue += step;
       break;
     case "ArrowLeft":
     case "ArrowDown":
       event.preventDefault();
       newValue -= step;
       break;
     case "Home":
       event.preventDefault();
       newValue = min;
       break;
     case "End":
       event.preventDefault();
       newValue = max;
       break;
     default:
       return;
   }
   
   updateValue(thumbIndex, newValue);
 }

 onMount(() => {
   const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
   const handleGlobalMouseUp = () => handleMouseUp();
   
   document.addEventListener("mousemove", handleGlobalMouseMove);
   document.addEventListener("mouseup", handleGlobalMouseUp);
   
   return () => {
     document.removeEventListener("mousemove", handleGlobalMouseMove);
     document.removeEventListener("mouseup", handleGlobalMouseUp);
   };
 });
</script>

<div
 bind:this={sliderElement}
 class="slider {className}"
 role="slider"
 aria-valuemin={min}
 aria-valuemax={max}
 aria-valuenow={value[0]}
 tabindex={disabled ? -1 : 0}
 on:mousedown={handleMouseDown}
 on:keydown={(e) => handleKeyDown(e, 0)}
 {...$$restProps}
>
 <div class="track">
   <div 
     class="range" 
     style="left: {isRange ? getPercentage(value[0]) : 0}%; width: {isRange ? getPercentage(value[1]) - getPercentage(value[0]) : getPercentage(value[0])}%"
   ></div>
 </div>
 
 <div 
   class="thumb" 
   style="left: {getPercentage(value[0])}%"
   role="slider"
   aria-valuemin={min}
   aria-valuemax={max}
   aria-valuenow={value[0]}
   tabindex={disabled ? -1 : 0}
   on:keydown={(e) => handleKeyDown(e, 0)}
 ></div>
 
 {#if isRange}
   <div 
     class="thumb" 
     style="left: {getPercentage(value[1])}%"
     role="slider"
     aria-valuemin={min}
     aria-valuemax={max}
     aria-valuenow={value[1]}
     tabindex={disabled ? -1 : 0}
     on:keydown={(e) => handleKeyDown(e, 1)}
   ></div>
 {/if}
</div>

<style>
 @layer base {
   .slider {
     position: relative;
     display: flex;
     align-items: center;
     min-width: 12rem;
     height: 1.5rem;
     touch-action: none;
     user-select: none;
     cursor: pointer;
   }

   .track {
     position: absolute;
     height: 0.375rem;
     width: 100%;
     background-color: var(--muted, #f5f5f5);
     border-radius: var(--radius-full, 9999px);
     transition: background-color var(--animation-duration-fast, 150ms) ease;
   }

   .range {
     position: absolute;
     height: 100%;
     background-color: var(--primary, #007bff);
     border-radius: var(--radius-full, 9999px);
     transition: background-color var(--animation-duration-fast, 150ms) ease;
   }

   .thumb {
     position: absolute;
     display: block;
     width: 1rem;
     height: 1rem;
     background-color: var(--primary, #007bff);
     border-radius: var(--radius-full, 9999px);
     border: 2px solid var(--background, white);
     box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
     transition: transform var(--animation-duration-fast, 150ms) ease,
       box-shadow var(--animation-duration-fast, 150ms) ease;
     transform: translateX(-50%);
     cursor: grab;
   }

   .thumb:active {
     cursor: grabbing;
   }

   .slider:hover .track {
     background-color: var(--muted-foreground, #6c757d);
   }

   .slider:hover .thumb,
   .slider:focus-visible .thumb {
     transform: translateX(-50%) scale(1.1);
     box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
   }

   .slider:focus-visible {
     outline: none;
   }

   .slider:focus-visible .track {
     outline: 2px solid var(--primary, #007bff);
     outline-offset: 2px;
   }

   .thumb:focus-visible {
     outline: 2px solid var(--primary, #007bff);
     outline-offset: 2px;
   }
 }
</style>