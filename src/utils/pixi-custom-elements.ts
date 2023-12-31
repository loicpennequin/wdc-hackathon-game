// main.js
import { Layer } from '@pixi/layers';
import { Viewport, type IViewportOptions } from 'pixi-viewport';
import ProjectionRenderer from 'vue3-pixi-projection';
import { patchProp, renderer } from 'vue3-pixi';

renderer.use(ProjectionRenderer);

renderer.use({
  name: 'Viewport',
  createElement: props => new Viewport(props as IViewportOptions),
  patchProp(el, key, prevValue, nextValue) {
    return patchProp(el, key, prevValue, nextValue);
  }
});

renderer.use({
  name: 'Layer',
  createElement: () => new Layer(),
  patchProp(el, key, prevValue, nextValue) {
    return patchProp(el, key, prevValue, nextValue);
  }
});
