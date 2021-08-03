import './style.css'

import * as THREE from 'three';

import {
  TTFLoader
} from 'three/examples/jsm/loaders/TTFLoader.js';
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls";

let container;
let camera, cameraTarget, scene, renderer;
let group, textMesh1, textMesh2, textGeo, material;
let firstLetter = true;

let text = 'N';
let textSmall = 'well, they say it..';
const height = 20,
  size = 70,
  hover = 35,
  curveSegments = 4,
  bevelThickness = 2,
  bevelSize = 1.5;

let font = null;
const mirror = true;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  // CAMERA

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
  camera.position.set(0, 400, 700);

  cameraTarget = new THREE.Vector3(0, 150, 0);

  // SCENE

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 250, 1400);

  // LIGHTS

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(0, 100, 90);
  pointLight.color.setHSL(Math.random(), 1, 0.5);
  scene.add(pointLight);


  material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    flatShading: true
  });

  group = new THREE.Group();
  group.position.y = 100;

  scene.add(group);

  const loader = new THREE.FontLoader();
  loader.load('assets/fonts/optimer_regular.typeface.json', function (response) {

    font = response;
    createText();
    createSmallText();

  });


  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true
    })
  );
  plane.position.y = 100;
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  // RENDERER

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // EVENTS

  container.style.touchAction = 'none';
  container.addEventListener('pointerdown', onPointerDown);

  document.addEventListener('keypress', onDocumentKeyPress);
  document.addEventListener('keydown', onDocumentKeyDown);

  window.addEventListener('resize', onWindowResize);

  // add orbit controls to scene
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.y = 0.5;
  controls.update();

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentKeyDown(event) {

  if (firstLetter) {

    firstLetter = false;
    text = '';
    textSmall = '';
  }

  const keyCode = event.keyCode;

  // backspace

  if (keyCode === 8) {

    event.preventDefault();

    text = text.substring(0, text.length - 1);
    refreshText();

    return false;

  }

}

function onDocumentKeyPress(event) {

  const keyCode = event.which;

  // backspace

  if (keyCode === 8) {

    event.preventDefault();

  } else {

    const ch = String.fromCharCode(keyCode);
    text += ch;

    refreshText();

  }

}

function createSmallText() {
  // create new cube and add it to the scene
  const tg = new THREE.TextGeometry(textSmall, {
    font: font,
    size: 10,
    height: 1,
    curveSegments: curveSegments,
    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelEnabled: true
  });
  tg.computeBoundingBox();

  const tm = new THREE.Mesh(tg, material);
  tm.position.x = 0;
  tm.position.y = 4;
  tm.position.z = 10;

  tm.rotation.x = 0;
  tm.rotation.y = Math.PI * 2;
  group.add(tm);
}

function createText() {

  textGeo = new THREE.TextGeometry(text, {
    font: font,
    size: size,
    height: height,
    curveSegments: curveSegments,

    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelEnabled: true

  });

  textGeo.computeBoundingBox();
  textGeo.computeVertexNormals();

  const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

  textMesh1 = new THREE.Mesh(textGeo, material);

  textMesh1.position.x = centerOffset;
  textMesh1.position.y = hover;
  textMesh1.position.z = 0;

  textMesh1.rotation.x = 0;
  textMesh1.rotation.y = Math.PI * 2;

  group.add(textMesh1);

  if (mirror) {

    textMesh2 = new THREE.Mesh(textGeo, material);

    textMesh2.position.x = centerOffset;
    textMesh2.position.y = -hover;
    textMesh2.position.z = height;

    textMesh2.rotation.x = Math.PI;
    textMesh2.rotation.y = Math.PI * 2;

    group.add(textMesh2);

  }

}

function refreshText() {

  group.remove(textMesh1);
  if (mirror) group.remove(textMesh2);

  if (!text) return;

  createText();

}

function onPointerDown(event) {

  if (event.isPrimary === false) return;

  pointerXOnPointerDown = event.clientX - windowHalfX;
  targetRotationOnPointerDown = targetRotation;

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

  if (event.isPrimary === false) return;

  pointerX = event.clientX - windowHalfX;

  targetRotation = targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.02;

}

function onPointerUp() {

  if (event.isPrimary === false) return;

  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);

}

//

function animate() {

  requestAnimationFrame(animate);

  group.rotation.y += (targetRotation - group.rotation.y) * 0.05;

  camera.lookAt(cameraTarget);

  renderer.render(scene, camera);

}