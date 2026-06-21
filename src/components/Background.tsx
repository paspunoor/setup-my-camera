/** Viewfinder ambiance — rule-of-thirds grid, soft instrument glow, grain, vignette. */
export function Background() {
  return (
    <>
      <div className="evf-glow" aria-hidden />
      <div className="evf-grid" aria-hidden />
      <div className="grain-bg" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}
