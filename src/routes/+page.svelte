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
  <div bind:this={mapElement} id="map" class="screen" />
</section>

<style>
  @import "leaflet/dist/leaflet.css";
  .screen {
    z-index: 10;
    background-color: rgba(240, 248, 255, 0);
    width: 100vw;
    height: 100vh;
    user-select: none;
  }
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }
</style>
