import { Raycaster, Vector2, Box3, Vector3 } from 'three';

export default class Interaction {
  constructor(viewer, surface, onOpen, onEmpty) {
    this.viewer = viewer; this.surface = surface;
    this.raycaster = new Raycaster(); this.pointer = new Vector2();
    this.hovered = false; this.dragging = false; this.down = null; this.lastInteraction = -Infinity;
    this.hit = (x, y) => {
      this.pointer.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, viewer.camera);
      const model = viewer.models.active;
      return model?.visible && this.raycaster.intersectObject(model, true).length > 0;
    };
    // Capture runs before OrbitControls' pointerdown handler.
    surface.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || viewer.transition || !this.hit(event.clientX, event.clientY) || this.down) {
        event.stopImmediatePropagation(); return;
      }
      this.down = { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false };
      this.dragging = true; this.lastInteraction = performance.now();
      surface.setPointerCapture(event.pointerId);
      surface.style.cursor = 'grabbing';
    }, true);
    surface.addEventListener('pointermove', (event) => {
      if (this.down && event.pointerId === this.down.id) {
        if (Math.hypot(event.clientX - this.down.x, event.clientY - this.down.y) > 6) this.down.moved = true;
        this.lastInteraction = performance.now();
      }
      this.hovered = !viewer.transition && Boolean(this.hit(event.clientX, event.clientY));
      surface.style.cursor = this.dragging ? 'grabbing' : this.hovered ? 'grab' : 'auto';
    });
    surface.addEventListener('pointerup', (event) => {
      if (!this.down || event.pointerId !== this.down.id) return;
      const click = !this.down.moved && Math.hypot(event.clientX - this.down.x, event.clientY - this.down.y) <= 6;
      this.down = null; this.dragging = false; this.lastInteraction = performance.now();
      if (click && !viewer.transition && this.hit(event.clientX, event.clientY)) onOpen(viewer.project);
      surface.style.cursor = this.hovered ? 'grab' : 'auto';
    });
    const cancel = () => { this.down = null; this.dragging = false; this.hovered = false; surface.style.cursor = 'auto'; };
    surface.addEventListener('pointercancel', cancel);
    surface.addEventListener('lostpointercapture', () => { if (this.down) cancel(); });
    surface.addEventListener('pointerleave', () => { if (!this.dragging) { this.hovered = false; surface.style.cursor = 'auto'; } });
    document.addEventListener('click', (event) => {
      if (event.target.closest('button, a, .panel')) return;
      if (!this.hit(event.clientX, event.clientY)) onEmpty();
    });
  }
  get inspecting() { return this.dragging || performance.now() - this.lastInteraction < 1800; }
  updateBounds() {
    if (this.dragging || !this.viewer.models.active) return;
    // Only the model's projected bounds capture touch gestures. Everywhere else scrolls natively.
    const box = new Box3().setFromObject(this.viewer.models.active);
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const p = new Vector3(x, y, z).project(this.viewer.camera);
      const sx = (p.x + 1) * innerWidth / 2, sy = (1 - p.y) * innerHeight / 2;
      left = Math.min(left, sx); right = Math.max(right, sx); top = Math.min(top, sy); bottom = Math.max(bottom, sy);
    }
    Object.assign(this.surface.style, { left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
  }
}
