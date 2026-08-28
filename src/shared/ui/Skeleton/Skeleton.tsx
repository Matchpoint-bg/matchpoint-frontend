export function Skeleton({ height, count = 1 }: { height: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skel" style={{ height }} aria-hidden="true" />
      ))}
    </>
  );
}
