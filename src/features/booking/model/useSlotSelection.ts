import { useEffect, useMemo, useState } from 'react';
import type { Slot } from '../../courts';

export function useSlotSelection(slots: Slot[], resetKey: string) {
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => setSelected([]), [resetKey]);

  const selection = useMemo(() => {
    const indices = [...selected].sort((a, b) => a - b);
    const contiguous = indices.every(
      (value, index) => index === 0 || value === (indices[index - 1] ?? -99) + 1,
    );
    return {
      indices,
      contiguous,
      total: indices.reduce((sum, index) => sum + (slots[index]?.price ?? 0), 0),
      first: slots[indices[0] ?? -1],
      last: slots[indices[indices.length - 1] ?? -1],
    };
  }, [selected, slots]);

  const toggle = (index: number) =>
    setSelected((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
    );

  return { selected, clear: () => setSelected([]), toggle, ...selection };
}
