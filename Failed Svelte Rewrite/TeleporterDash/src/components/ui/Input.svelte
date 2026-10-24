<script context="module" lang="ts">
 export type InputProps = {
   value?: string;
   placeholder?: string;
   disabled?: boolean;
   readonly?: boolean;
   required?: boolean;
   type?: string;
   name?: string;
   id?: string;
   className?: string;
 };
</script>

<script lang="ts">
 import { createEventDispatcher } from "svelte";

 export let value: string = "";
 export let placeholder: string = "";
 export let disabled: boolean = false;
 export let readonly: boolean = false;
 export let required: boolean = false;
 export let type: string = "text";
 export let name: string | undefined = undefined;
 export let id: string | undefined = undefined;
 export let className: string = "";

 const dispatch = createEventDispatcher();

 function handleInput(event: Event) {
   const target = event.target as HTMLInputElement;
   value = target.value;
   dispatch("input", { value, event });
 }

 function handleChange(event: Event) {
   dispatch("change", { value, event });
 }

 function handleFocus(event: FocusEvent) {
   dispatch("focus", event);
 }

 function handleBlur(event: FocusEvent) {
   dispatch("blur", event);
 }
</script>

<input
 bind:value
 {type}
 {placeholder}
 {disabled}
 {readonly}
 {required}
 {name}
 {id}
 class="input {className}"
 on:input={handleInput}
 on:change={handleChange}
 on:focus={handleFocus}
 on:blur={handleBlur}
 {...$$restProps}
/>

<style>
 @layer base {
   .input {
     font-family: var(--font-family-base, inherit);
     font-size: 1rem;
     line-height: 1.5;
     color: var(--foreground, #000);
     background-color: var(--card, white);
     border: 1px solid var(--border, #e5e5e5);
     border-radius: var(--radius, 0.375rem);
     padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
     width: 100%;
     transition: border-color var(--animation-duration-normal, 200ms) ease,
       background-color var(--animation-duration-normal, 200ms) ease,
       box-shadow var(--animation-duration-normal, 200ms) ease,
       transform var(--animation-duration-fast, 150ms) ease;
     outline: none;
     height: 2rem;
     box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02),
       0 1px 0 rgba(255, 255, 255, 0.3);
   }

   .input::placeholder {
     color: var(--muted-foreground, #6c757d);
     opacity: 0.7;
   }

   .input:hover {
     border-color: color-mix(in srgb, var(--primary, #007bff) 80%, transparent);
     background-color: color-mix(in srgb, var(--card, white) 98%, var(--primary, #007bff) 2%);
     box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02),
       0 2px 4px rgba(0, 0, 0, 0.05);
   }

   .input:focus {
     border-color: var(--primary, #007bff);
     box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, #007bff) 15%, transparent),
       0 2px 4px rgba(0, 0, 0, 0.05);
     background-color: var(--card, white);
   }

   .input:disabled {
     background-color: var(--muted, #f5f5f5);
     color: var(--muted-foreground, #6c757d);
     cursor: not-allowed;
     opacity: 0.75;
     box-shadow: none;
     transform: none;
   }

   /* Dark mode adjustments */
   :global(.dark) .input {
     background-color: color-mix(in srgb, var(--background, #000) 80%, black);
     box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1),
       0 1px 0 rgba(255, 255, 255, 0.05);
   }

   :global(.dark) .input:hover {
     background-color: color-mix(in srgb, var(--background, #000) 75%, black);
     border-color: color-mix(in srgb, var(--primary, #007bff) 90%, white);
     box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1),
       0 2px 4px rgba(0, 0, 0, 0.15);
   }

   :global(.dark) .input:focus {
     background-color: color-mix(in srgb, var(--background, #000) 80%, black);
     box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, #007bff) 25%, transparent),
       0 2px 4px rgba(0, 0, 0, 0.15);
   }
 }
</style>