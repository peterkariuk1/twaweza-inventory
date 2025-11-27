import React, { useRef, useEffect, useState } from "react";
import { IconButton, Card, CardContent } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const LowStockSlider = ({ items }) => {
  const scrollRef = useRef(null);
  const cardRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Duplicate items to create a seamless infinite loop
  const loopItems = [...items, ...items];

  useEffect(() => {
    if (paused) return;

    let interval;

    const start = () => {
      interval = setInterval(() => {
        const container = scrollRef.current;
        const cardWidth = cardRef.current?.offsetWidth + 8 || 120;

        if (!container) return;

        container.scrollBy({ left: cardWidth, behavior: "smooth" });

        const half = container.scrollWidth / 2;

        // If we've reached the duplicated half → reset back to start of original list instantly
        if (container.scrollLeft >= half - cardWidth) {
          setTimeout(() => {
            container.scrollTo({ left: 0, behavior: "instant" });
          }, 400);
        }
      }, 2000);
    };

    start();
    return () => clearInterval(interval);
  }, [paused]);

  const scrollLeft = () => {
    const w = cardRef.current.offsetWidth + 8;
    scrollRef.current.scrollBy({ left: -w, behavior: "smooth" });
  };

  const scrollRight = () => {
    const w = cardRef.current.offsetWidth + 8;
    scrollRef.current.scrollBy({ left: w, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", width: "100%", marginTop: "12px" }}>
      <IconButton
        onClick={scrollLeft}
        sx={{
          position: "absolute",
          top: "40%",
          left: -8,
          zIndex: 10,
          padding: "4px",
          background: "rgba(0,0,0,0.4)",
          "&:hover": { background: "rgba(0,0,0,0.6)" },
        }}
      >
        <ArrowBackIosNewIcon sx={{ color: "white", fontSize: 14 }} />
      </IconButton>

      <div
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollBehavior: "smooth",
          gap: "8px",
          width: "400px",
          padding: "0 28px",
          scrollbarWidth: "none",
        }}
      >
        {loopItems.map((x, index) => (
          <Card
            key={index}
            ref={index === 0 ? cardRef : null}
            sx={{
              minWidth: 120,
              flexShrink: 0,
              borderRadius: "14px",
              background: "#1f1f1f",
              color: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              padding: "4px",
            }}
          >
            <CardContent sx={{ padding: "8px !important" }}>
              <p style={{ fontWeight: "bold", margin: 0, fontSize: "12px" }}>
                {x.itemName} {x.pages || ""}
              </p>
              <small style={{ opacity: 0.6, fontSize: "10px" }}>
                {x.category}
              </small>

              <p style={{ marginTop: "6px", fontSize: "13px" }}>
                <strong>{x.quantity}</strong> {x.entryType}
              </p>

              <p style={{ fontSize: "10px", opacity: 0.6 }}>
                {x.totalUnits} units
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <IconButton
        onClick={scrollRight}
        sx={{
          position: "absolute",
          top: "40%",
          right: -8,
          zIndex: 10,
          padding: "4px",
          background: "rgba(0,0,0,0.4)",
          "&:hover": { background: "rgba(0,0,0,0.6)" },
        }}
      >
        <ArrowForwardIosIcon sx={{ color: "white", fontSize: 14 }} />
      </IconButton>
    </div>
  );
};

export default LowStockSlider;
