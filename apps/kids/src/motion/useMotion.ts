import {
  effectiveAnimationLevel,
  type AnimationLevel,
} from '@luminol/kids-learning';
import { MOTION, type Motion } from '@luminol/kids-ui';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Motion settings for the child, with the device reduce-motion switch winning. */
export function useMotion(level: AnimationLevel): Motion {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return MOTION[effectiveAnimationLevel(level, reduceMotion)];
}
