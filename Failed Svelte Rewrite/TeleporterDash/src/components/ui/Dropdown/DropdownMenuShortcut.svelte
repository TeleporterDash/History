<!-- DropdownMenuShortcut.svelte -->
<script lang="ts">
  export let className: string = "";
</script>

<span class="dropdown-shortcut {className}" {...$$restProps}>
  <slot />
</span>
