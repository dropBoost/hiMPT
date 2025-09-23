'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomScrollbar({
  width = '100%',
  height = '400px',
  trackSize = '10px',
  thumbRadius = 6,
  minThumbPct = 10,
  trackBg = 'transparent',
  thumbBg = '#888',
  thumbBgHover = '#555',
  children,
}) {
  const viewportRef = useRef(null);

  // stile thumb
  const [thumbV, setThumbV] = useState({ height: 0, top: 0 });
  const [thumbH, setThumbH] = useState({ width: 0, left: 0 });
  const [hoverV, setHoverV] = useState(false);
  const [hoverH, setHoverH] = useState(false);

  // aggiorna posizione e dimensione thumb
  const recalcThumbs = () => {
    const vp = viewportRef.current;
    if (!vp) return;

    // verticale
    const vh = vp.clientHeight;
    const sh = vp.scrollHeight;
    const st = vp.scrollTop;
    const rh = (vh / sh) * vh;
    const mh = (minThumbPct / 100) * vh;
    const height = Math.max(rh, mh);
    const maxSt = sh - vh;
    const maxTh = vh - height;
    const top = maxSt > 0 ? (st / maxSt) * maxTh : 0;

    // orizzontale
    const vw = vp.clientWidth;
    const sw = vp.scrollWidth;
    const sl = vp.scrollLeft;
    const rw = (vw / sw) * vw;
    const mw = (minThumbPct / 100) * vw;
    const widthPx = Math.max(rw, mw);
    const maxSl = sw - vw;
    const maxTl = vw - widthPx;
    const left = maxSl > 0 ? (sl / maxSl) * maxTl : 0;

    setThumbV({ height, top });
    setThumbH({ width: widthPx, left });
  };

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    recalcThumbs();
    const onScroll = () => recalcThumbs();
    vp.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => recalcThumbs());
    ro.observe(vp);

    return () => {
      vp.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
      }}
    >
      {/* contenuto scrollabile */}
      <div
        ref={viewportRef}
        className="no-native-scrollbar"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </div>

      {/* track verticale */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: trackSize,
          height: '100%',
          background: trackBg,
          borderRadius: thumbRadius,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: thumbV.top,
            right: 0,
            width: '100%',
            height: thumbV.height,
            background: hoverV ? thumbBgHover : thumbBg,
            borderRadius: thumbRadius,
            cursor: 'grab',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={() => setHoverV(true)}
          onMouseLeave={() => setHoverV(false)}
        />
      </div>

      {/* track orizzontale */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: trackSize,
          width: '100%',
          background: trackBg,
          borderRadius: thumbRadius,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: thumbH.left,
            bottom: 0,
            height: '100%',
            width: thumbH.width,
            background: hoverH ? thumbBgHover : thumbBg,
            borderRadius: thumbRadius,
            cursor: 'grab',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={() => setHoverH(true)}
          onMouseLeave={() => setHoverH(false)}
        />
      </div>
    </div>
  );
}
