<!-- DropdownMenuSeparator.svelte -->
<script lang="ts">
  export let className: string = "";
</script>

<div class="dropdown-separator {className}" role="separator" {...$$restProps}></div>
