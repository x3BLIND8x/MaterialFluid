import { settledSpring } from './motion-engine';

/** Travel stays independent of the button-style press depth and radius spring. */
export const selectionTransition = settledSpring({ type: 'spring', stiffness: 620, damping: 42, mass: .65 });
