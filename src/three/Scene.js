import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ModelManager from './ModelManager.js';
import PostProcessing from './PostProcessing.js';
import Interaction from './Interaction.js';

export const orbitSettings = {
  enableDamping: true, dampingFactor: 0.07, enablePan: false, enableZoom: false,
  rotateSpeed: 0.6, minPolarAngle: Math.PI * 0.18, maxPolarAngle: Math.PI * 0.82,
};
export const defaultCamera = { azimuth: 0.35, polar: 1.25, distance: 5.4 };

export default class PortfolioScene {
  constructor(projects, onOpen, onEmpty) {
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#242625');
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
    document.querySelector('#scene').append(this.renderer.domElement);
    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault(); this.renderer.setAnimationLoop(null);
      document.querySelector('.viewer-status').textContent = '3D view unavailable. Select a project title to explore.';
      document.querySelector('#interaction').style.display = 'none';
    });
    this.scene.add(new THREE.HemisphereLight('#e6e9e0', '#46443d', 2.1));
    const key = new THREE.DirectionalLight('#fff4df', 3.2); key.position.set(-3, 5, 4); this.scene.add(key);
    const rim = new THREE.DirectionalLight('#a6bdc2', 1.5); rim.position.set(4, 1, -3); this.scene.add(rim);
    this.models = new ModelManager(this.scene, projects);
    this.post = new PostProcessing(this.renderer, this.scene, this.camera);
    const surface = document.querySelector('#interaction');
    this.interaction = new Interaction(this, surface, onOpen, onEmpty);
    this.controls = new OrbitControls(this.camera, surface);
    Object.assign(this.controls, orbitSettings);
    this.controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: null, RIGHT: null };
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: null };
    this.panelOpen = false;
    this.offset = new THREE.Vector2();
    this.activate(projects[0], true);
    this.resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      this.renderer.setPixelRatio(ratio); this.renderer.setSize(innerWidth, innerHeight);
      this.post.resize(innerWidth, innerHeight, ratio);
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.fov = innerWidth < 700 ? 48 : 38;
      this.camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', this.resize); this.resize();
    this.previous = performance.now();
    this.renderer.setAnimationLoop((now) => this.tick(now));
    this.models.preload();
  }
  cameraFor(project) {
    const settings = { ...defaultCamera, ...project.camera };
    settings.distance = project.cameraDistance ?? settings.distance;
    return new THREE.Vector3().setFromSphericalCoords(settings.distance, settings.polar, settings.azimuth);
  }
  activate(project, immediate = false) {
    if (this.project?.id === project.id) return;
    this.project = project;
    if (immediate) {
      this.displayedSection = document.getElementById(project.id);
      this.models.activate(project); this.camera.position.copy(this.cameraFor(project)); this.controls.target.set(0, 0, 0); this.controls.update(); this.post.setProject(project); return;
    }
    this.controls.enabled = false;
    // Reset clears residual OrbitControls inertia before interpolating the camera.
    const position = this.camera.position.clone();
    this.controls.reset(); this.camera.position.copy(position);
    this.transition = { start: performance.now(), from: position, to: this.cameraFor(project), project, switched: false };
  }
  tick(now) {
    const delta = Math.min((now - this.previous) / 1000, 0.05); this.previous = now;
    let phase = 1, outgoing = false;
    if (this.transition) {
      const t = this.transition;
      const p = Math.min((now - t.start) / (this.motion.matches ? 80 : 560), 1);
      const smooth = p * p * (3 - 2 * p);
      this.camera.position.lerpVectors(t.from, t.to, smooth); this.camera.lookAt(0, 0, 0);
      if (p >= 0.5 && !t.switched) {
        this.models.activate(t.project); this.post.setProject(t.project);
        this.displayedSection = document.getElementById(t.project.id);
        t.switched = true;
      }
      outgoing = p < 0.5; phase = Math.abs(p * 2 - 1);
      if (p === 1) { this.transition = null; this.controls.enabled = true; this.controls.target.set(0, 0, 0); this.controls.update(); }
    } else this.controls.update();
    const mobile = innerWidth < 700;
    const tx = this.panelOpen && !mobile ? innerWidth * 0.14 : 0;
    const ty = this.panelOpen && mobile ? innerHeight * 0.2 : 0;
    const speed = this.motion.matches ? 100 : 9;
    this.offset.x = THREE.MathUtils.damp(this.offset.x, tx, speed, delta);
    this.offset.y = THREE.MathUtils.damp(this.offset.y, ty, speed, delta);
    // Match the displayed model to its section in document space. Apply scroll
    // directly so it moves with the HTML; only the panel displacement is damped.
    // Keep the outgoing section until its model has finished fading out.
    const sectionBounds = this.displayedSection.getBoundingClientRect();
    const sectionOffset = innerHeight / 2 - (sectionBounds.top + sectionBounds.height / 2);
    this.camera.setViewOffset(innerWidth, innerHeight, this.offset.x, sectionOffset + this.offset.y, innerWidth, innerHeight);
    this.models.update(now / 1000, delta, { reduced: this.motion.matches, inspecting: this.interaction.inspecting, hovered: this.interaction.hovered, phase, outgoing });
    this.scene.updateMatrixWorld(true); this.camera.updateMatrixWorld(true);
    this.interaction.updateBounds();
    this.post.render();
  }
}
