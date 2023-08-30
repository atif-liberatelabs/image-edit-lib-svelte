<script>
  // @ts-nocheck

  import { onMount } from "svelte";

  let mapElement;
  let mapData = [],
    imageData = [];
  let map;

  onMount(async () => {
    let Map = await import("../map");

    map = new Map.default(mapElement, mapData, imageData);
    console.log(map);
  });
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <div
    bind:this={mapElement}
    id="map"
    class=" h-screen w-screen overflow-hidden"
  />
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }
</style>
