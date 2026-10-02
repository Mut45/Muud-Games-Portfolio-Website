import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { assetUrl } from '../data/projects.js';

// Positive Y rotation is counterclockwise when viewed from above.
export const idleRotationSpeed = THREE.MathUtils.degToRad(2); // Degrees per second: one turn in 3 minutes.

export default class ModelManager {
  constructor(scene, projects) {
    this.scene = scene;
    this.projects = projects;
    this.cache = new Map();
    this.loader = new GLTFLoader();
    this.active = null;
    this.hoverScale = 1;
    this.rotationSpeed = 0;
    projects.forEach((project) => {
      const root = this.normalize(this.placeholder(project), project);
      root.visible = false;
      scene.add(root);
      this.cache.set(project.id, root);
    });
  }
  placeholder(project) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: project.color, roughness: 0.62, metalness: 0.25, flatShading: true });
    const dark = new THREE.MeshStandardMaterial({ color: '#434a46', roughness: 0.8 });
    const add = (geometry, position = [0, 0, 0], mat = material) => {
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...position); group.add(mesh); return mesh;
    };
    if (project.placeholder === 'structure') {
      // A hollow architectural cube, built from twelve beams.
      for (const a of [-0.8, 0.8]) for (const b of [-0.8, 0.8]) {
        add(new THREE.BoxGeometry(0.28, 1.88, 0.28), [a, 0, b]);
        add(new THREE.BoxGeometry(1.88, 0.28, 0.28), [0, a, b]);
        add(new THREE.BoxGeometry(0.28, 0.28, 1.88), [a, b, 0]);
      }
      const core = add(new THREE.BoxGeometry(0.7, 0.7, 0.7), [0, 0, 0], dark);
      core.rotation.set(0.35, 0.4, 0.2);
    } else if (project.placeholder === 'orbit') {
      add(new THREE.IcosahedronGeometry(0.9, 1));
      const ring = add(new THREE.TorusGeometry(1.35, 0.065, 6, 64), [0, 0, 0], dark);
      ring.rotation.set(1.15, 0.3, 0.2);
      add(new THREE.IcosahedronGeometry(0.18, 0), [1.25, 0.25, 0.35]);
    } else {
      for (let i = 0; i < 5; i++) {
        const step = add(new THREE.BoxGeometry(1.3, 0.21, 1.3), [0, (i - 2) * 0.38, 0]);
        step.rotation.y = i * 0.22;
      }
      add(new THREE.OctahedronGeometry(0.38), [0, 1.4, 0]);
      add(new THREE.CylinderGeometry(0.08, 0.08, 2, 8), [0, 0, 0], dark);
    }
    return group;
  }
  normalize(object, project) {
    const offset = project.rotationOffset ?? [0, 0, 0];
    object.rotation.set(...offset);
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const content = new THREE.Group();
    object.position.sub(center);
    content.add(object);
    content.scale.setScalar(1.1 / Math.max(size.x, size.y, size.z, 0.001) * (project.modelScale ?? 1));
    const root = new THREE.Group(); root.add(content);
    root.userData.opacity = 1;
    root.traverse((node) => {
      if (!node.isMesh) return;
      for (const material of [].concat(node.material)) {
        material.userData.baseOpacity = material.opacity;
        if (project.nearestTextureFiltering) {
          for (const value of Object.values(material)) if (value?.isTexture) {
            value.magFilter = THREE.NearestFilter; value.minFilter = THREE.NearestFilter; value.needsUpdate = true;
          }
        }
      }
    });
    return root;
  }
  async preload() {
    await Promise.all(this.projects.filter((p) => p.model).map(async (project) => {
      try {
        const gltf = await this.loader.loadAsync(assetUrl(project.model));
        const replacement = this.normalize(gltf.scene, project);
        const previous = this.cache.get(project.id);
        replacement.visible = previous.visible;
        replacement.children[0].rotation.y = previous.children[0].rotation.y;
        this.scene.add(replacement);
        this.scene.remove(previous);
        this.cache.set(project.id, replacement);
        if (this.active === previous) this.active = replacement;
        this.disposeObject(previous);
      } catch (error) { console.warn(`Using placeholder for ${project.id}:`, error); }
    }));
  }
  activate(project) {
    this.cache.forEach((root) => { root.visible = false; });
    this.active = this.cache.get(project.id);
    this.active.visible = true;
    this.hoverScale = 1;
  }
  update(time, delta, { reduced, inspecting, hovered, phase = 1, outgoing = false }) {
    if (!this.active) return;
    this.hoverScale = THREE.MathUtils.damp(this.hoverScale, hovered ? 1.035 : 1, 10, delta);
    const amount = reduced ? 0 : 1;
    const paused = reduced || inspecting || phase < 1;
    this.rotationSpeed = paused ? 0 : THREE.MathUtils.damp(this.rotationSpeed, idleRotationSpeed, 2, delta);
    const content = this.active.children[0];
    content.rotation.y = (content.rotation.y + this.rotationSpeed * delta) % (Math.PI * 2);
    this.active.position.y = (outgoing ? 1 - phase : phase - 1) * 0.18;
    if (!inspecting) {
      this.active.position.y += Math.sin(time * 0.8) * 0.025 * amount;
    }
    this.active.scale.setScalar((0.94 + phase * 0.06) * this.hoverScale);
    this.active.traverse((node) => {
      if (!node.isMesh) return;
      for (const mat of [].concat(node.material)) {
        const transparent = phase < 0.999 || mat.userData.baseOpacity < 1;
        if (mat.transparent !== transparent) { mat.transparent = transparent; mat.needsUpdate = true; }
        mat.opacity = mat.userData.baseOpacity * phase;
      }
    });
  }
  disposeObject(root) {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    root.traverse((node) => { if (node.isMesh) { geometries.add(node.geometry); [].concat(node.material).forEach((mat) => materials.add(mat)); } });
    materials.forEach((mat) => { Object.values(mat).forEach((v) => { if (v?.isTexture) textures.add(v); }); mat.dispose(); });
    geometries.forEach((g) => g.dispose()); textures.forEach((t) => t.dispose());
  }
  dispose() { this.cache.forEach((root) => this.disposeObject(root)); }
}
