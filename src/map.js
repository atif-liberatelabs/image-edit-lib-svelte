// @ts-nocheck

import { LatLng } from "leaflet";

export default class Map {
  constructor(mapElement, mapData, imageData, update = () => {}) {
    this.map = null;
    this.leaflet = null;
    this.image = null;
    this.mapElement = mapElement;

    this.imageData = imageData;
    this.mapData = mapData;

    this.mode = "draw";

    this.capture = false;
    this.line = [];
    this.lineVisual = [];
    this.tempLines = [];

    this.activeIndex = 0;
    this.active = 0;

    this.update = update;
    this.globalActiveKey = "";

    this._init();
  }

  async _init() {
    this.leaflet = await import("leaflet");

    this.map = this.leaflet.map(this.mapElement, {
      maxZoom: 5,
      minZoom: -2,
      crs: this.leaflet.CRS.Simple,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
    });
    // .setView([300, 200], 2);
    this.map.dragging.disable();
    this.map.scrollWheelZoom.disable();

    this.image = this.imageOverlay(this.image, "/starter.png", [810, 1100]);

    this._addKeyEvents();

    this.addEventListenerMap("mousemove", this.mouseMove);
    this.addEventListenerMap("mousedown", this.mouseDown);
    this.addEventListenerMap("mouseup", this.mouseUp);
  }

  addEventListenerMap(event, callback) {
    // console.log(event, callback);

    this.map?.on(event, callback);
  }

  mouseDown(e) {
    console.log(this.capture);
    if (this.mode == "draw") {
      this.capture = true;
      console.log(this.capture);
    }
  }

  mouseMove(e) {
    console.log("sd");

    if (this.capture) {
      this.line.push(e.latlng);
      this.lineVisual.push(this.leaflet?.polyline(this.line).addTo(this.map));
    }
  }

  mouseUp(e) {
    console.log(this.capture);

    if (this.capture) {
      this.lineVisual.forEach((elm) => {
        this.map.removeLayer(elm);
      });
      this.lineVisual = [];
      this.capture = false;
      this.addLine(this.line);
      this.line = [];
      this.mode = "";
    }
  }

  mouseClick(e) {
    let coordinates = e.latlng;

    if (this.mode == "pin") this.addMarker(coordinates, this.active);
    else if (this.mode == "circle") this.addCircle(coordinates, this.active);
  }

  _clipBounds(bounds) {
    let zoom = -1;

    if (bounds[0] > 1000) zoom = -2;

    return zoom;
  }

  _addKeyEvents() {
    document.addEventListener("keydown", (e) => {
      this.globalActiveKey = e.key;

      // console.log(  this.globalActiveKey);

      if (this.globalActiveKey == "z") {
        e.preventDefault();
        this.map.scrollWheelZoom.enable();
      }

      if (this.globalActiveKey == "Alt") {
        this.map.dragging.enable();
      }
    });

    document.addEventListener("keyup", (e) => {
      this.globalActiveKey = "";

      this.map.dragging.disable();
      this.map.scrollWheelZoom.disable();
    });
  }

  imageOverlay(image, imageUrl, bounds) {
    if (bounds) {
      let zoom = this._clipBounds(bounds);

      let calclulatedBounds = new LatLng(bounds[0] / 2, bounds[1] / 2);

      this.map?.setView(calclulatedBounds, zoom);

      var imageBounds = [new LatLng(bounds[0], 0), new LatLng(0, bounds[1])];

      image = this.leaflet?.imageOverlay(imageUrl, imageBounds);

      image.addTo(this.map);
    }
    return image;
  }

  removeAllMarkers() {
    this.mapData.forEach((element) => {
      this.map?.removeLayer(element.type);
    });

    return [];
  }

  populateMarkers(recieved) {
    this.mapData = [];
    this.imageData = [];

    recieved.data.forEach((element) => {
      if (element.type === "marker") {
        this.addMarker(element.coord, element);
      } else if (element.type === "circle") {
        this.addCircle(element.coord, element);
      } else if (element.type === "polygon") {
        this.addLine(element.coord, element);
      }
    });

    return [this.mapData, this.imageData];
  }

  _formPipeData(obj, coordinates, type) {
    obj.ID = new Date().getTime() + Math.random() * 1000;
    this.map?.addLayer(obj);
    this.mapData.push({ type: obj });
    this.imageData.push({
      coord: coordinates,
      title: this.mapData.length,
      data: "",
      type: type,
    });

    this.update({ id: this.active }, { data: this.imageData });
  }

  _delegatePipeData(obj, data, imageData, existing) {
    obj.ID = new Date().getTime() + Math.random() * 1000;
    this.map?.addLayer(obj);
    data.push({ type: obj });
    imageData.push(existing);
  }

  addMarker(coordinates, existing) {
    //class
    var greenIcon = this.leaflet?.icon({
      iconUrl: "/options/0.svg",
      shadowUrl: "",

      iconSize: [38, 60], // size of the icon
      shadowSize: [50, 64], // size of the shadow
      iconAnchor: [17, 45], // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62], // the same for the shadow
      popupAnchor: [3, -30], // point from which the popup should open relative to the iconAnchor
    });
    let marker = this.leaflet
      ?.marker(coordinates, { icon: greenIcon })
      .addTo(this.map)
      .bindPopup(existing ? `${existing.title}` : "pin")
      .on("click", this.activeIndex);

    if (!existing) this._formPipeData(marker, coordinates, "marker");
    else this._delegatePipeData(marker, existing);

    // console.log(imageData, "img");
  }

  addCircle(coordinates, existing) {
    let circle = this.leaflet
      ?.circle(coordinates, 40)
      .addTo(this.map)
      .on("click", this.activeIndex);

    circle?.setStyle({ fillColor: "#257ef4" });

    if (!existing) this._formPipeData(circle, coordinates, "circle");
    else this._delegatePipeData(circle, existing);
  }

  addLine(coordinates, existing) {
    // console.log(coordinates);

    let polyLine = this.leaflet
      ?.polyline(coordinates)
      .addTo(this.map)
      .on("click", this.activeIndex);

    polyLine?.setStyle({ fillColor: "#257ef4" });

    if (!polyLine) return;

    if (!existing) this._formPipeData(polyLine, coordinates, "polygon");
    else this._delegatePipeData(polyLine, existing);
  }
}
