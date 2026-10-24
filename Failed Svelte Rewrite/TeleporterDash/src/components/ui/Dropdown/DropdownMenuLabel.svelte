<!-- DropdownMenuLabel.svelte -->
<script lang="ts">
  export let className: string = "";
  export let inset: boolean = false;
</script>

<div class="dropdown-label {className} {inset ? 'inset' : ''}" {...$$restProps}>
  <slot />
</div>
