import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const renderSettings = { pixelSize: 2, normalEdgeStrength: 0.25, depthEdgeStrength: 0.35 };

export default class PostProcessing {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);
    this.pass = new RenderPixelatedPass(renderSettings.pixelSize, scene, camera, renderSettings);
    this.pass.normalEdgeStrength = renderSettings.normalEdgeStrength;
    this.pass.depthEdgeStrength = renderSettings.depthEdgeStrength;
    this.composer.addPass(this.pass);
    // Convert the composer's linear color output to display sRGB (not a visual effect).
    this.output = new OutputPass();
    this.composer.addPass(this.output);
  }
  setProject(project) { this.pass.setPixelSize(project.pixelSize ?? renderSettings.pixelSize); }
  resize(width, height, ratio) {
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(width, height);
  }
  render() { this.composer.render(); }
  dispose() { this.pass.dispose(); this.output.dispose(); this.composer.dispose(); }
}
