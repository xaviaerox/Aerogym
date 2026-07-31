import React, { memo } from 'react';
import type { BodyView } from '../../types/HumanBody';

interface BodyOutlineProps {
  view: BodyView;
}

function BodyOutlineBase({ view: _view }: BodyOutlineProps) {
  // The body outline is formed by the muscle paths themselves.
  // No separate outline rendering needed.
  return null;
}

export const BodyOutline = memo(BodyOutlineBase);
