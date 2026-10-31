import { Raycaster, Vector2, Box3, Vector3 } from 'three';

export default class Interaction {
  constructor(viewer, surface, onOpen, onEmpty) {
    this.viewer = viewer; this.surface = surface;
    this.raycaster = new Raycaster(); this.pointer = new Vector2();
    this.hovered = false; this.dragging = false; this.down = null; this.lastInteraction = -Infinity;
    this.mousePosition = null;
    this.hintSection = null;
    this.hintAnchors = new WeakMap();
    this.touchHint = matchMedia('(hover: none) and (pointer: coarse)');
    this.navigation = document.querySelector('.navigation');
    this.footer = document.querySelector('.viewer-footer');
    document.addEventListener('pointermove', (event) => {
      this.mousePosition = event.pointerType === 'mouse' ? { x: event.clientX, y: event.clientY } : null;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { this.mousePosition = null; });
    window.addEventListener('blur', () => { this.mousePosition = null; });
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
  updateHint() {
    const point = this.mousePosition;
    const touch = this.touchHint.matches;
    const enabled = !this.viewer.panelOpen && !this.viewer.transition && !this.dragging;
    const displayed = this.viewer.displayedSection;
    // Capture once, before hover. Store section-local coordinates so scrolling
    // still carries the hint, while rotation, floating and hover scaling do not.
    if (enabled && displayed && this.modelBounds && this.viewer.offset.length() < 0.5) {
      const hint = displayed.querySelector('.model-hover-hint');
      const label = hint.querySelector('.hint-label');
      const text = touch ? 'Tap To Open' : 'Click To Open';
      if (label.textContent !== text) label.textContent = text;
      const previous = this.hintAnchors.get(displayed);
      const model = this.viewer.models.active;
      const layout = `${innerWidth}:${innerHeight}:${hint.offsetWidth}:${hint.offsetHeight}:${touch}`;
      if (!previous || previous.model !== model || previous.layout !== layout) {
        const rect = displayed.getBoundingClientRect();
        const caption = displayed.querySelector('.project-caption').getBoundingClientRect();
        const margin = innerWidth < 700 ? 16 : 24;
        const width = hint.offsetWidth, height = hint.offsetHeight;
        const minY = this.navigation.getBoundingClientRect().bottom + 12;
        const footerHeight = innerHeight - this.footer.getBoundingClientRect().top;
        const maxY = Math.min(caption.top - rect.top - 12, rect.height - footerHeight - 12) - height;
        let x = Math.max(margin, Math.min(this.modelBounds.left - rect.left - width * (touch ? 0 : 0.65), rect.width - margin - width));
        let y = Math.max(minY, Math.min(this.modelBounds.top - rect.top - height - 12, maxY));
        // The portrait's bounds include empty space; tuck its hint closer in.
        if (displayed.classList.contains('about-section')) {
          x = Math.min(x + Math.min(innerWidth * 0.05, 72), rect.width - margin - width);
          y = Math.min(y + Math.min(innerHeight * 0.06, 54), maxY);
        }
        hint.style.left = `${x}px`;
        hint.style.top = `${y}px`;
        this.hintAnchors.set(displayed, { model, layout });
      }
    }
    // Recheck against the moving model so scrolling/idle rotation cannot leave a stale hint.
    let section = enabled && (touch || (point && document.elementFromPoint(point.x, point.y) === this.surface && this.hit(point.x, point.y)))
      ? this.viewer.displayedSection : null;
    if (section && this.hintAnchors.has(section)) {
      const hint = section.querySelector('.model-hover-hint');
      const rect = hint.getBoundingClientRect();
      // Hide at viewport edges instead of moving the saved anchor.
      if (rect.top < this.navigation.getBoundingClientRect().bottom + 12 ||
          rect.bottom > this.footer.getBoundingClientRect().top - 12) section = null;
    } else section = null;
    if (section === this.hintSection) return;
    this.hintSection?.classList.remove('is-model-hovered');
    section?.classList.add('is-model-hovered');
    this.hintSection = section;
  }
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
    this.modelBounds = { left, top, right, bottom };
  }
}
