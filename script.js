// ── Nav toggle ──
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ── Thread graph: draw SVG connector lines dynamically ──
function drawThreadLines() {
  document.querySelectorAll(".thread-graph").forEach((graph) => {
    // Remove any previously drawn SVG
    graph.querySelectorAll(".thread-svg").forEach((s) => s.remove());

    const root = graph.querySelector(".thread-root");
    const branches = graph.querySelectorAll(
      ".thread-branches span:not(.thread-more)"
    );
    if (!root || !branches.length) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("thread-svg");
    graph.appendChild(svg);

    const graphRect = graph.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();

    const rootX = rootRect.left + rootRect.width / 2 - graphRect.left;
    const rootBottom = rootRect.bottom - graphRect.top;

    const color = "rgba(111, 168, 255, 0.45)";
    const attrs = { stroke: color, "stroke-width": "1", fill: "none" };

    const branchMids = Array.from(branches).map((b) => {
      const r = b.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - graphRect.left,
        y: r.top - graphRect.top,
      };
    });

    // Midpoint for the elbow
    const elbowY = rootBottom + (branchMids[0].y - rootBottom) / 2;

    // Vertical drop from root down to elbow
    addLine(svg, rootX, rootBottom, rootX, elbowY, attrs);

    // Horizontal bar spanning first to last branch midpoints
    const leftX = branchMids[0].x;
    const rightX = branchMids[branchMids.length - 1].x;
    addLine(svg, leftX, elbowY, rightX, elbowY, attrs);

    // Vertical drop from elbow down to each branch top
    branchMids.forEach(({ x, y }) => {
      addLine(svg, x, elbowY, x, y, attrs);
    });
  });
}

function addLine(svg, x1, y1, x2, y2, attrs) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  Object.entries(attrs).forEach(([k, v]) => line.setAttribute(k, v));
  svg.appendChild(line);
}

// Run after layout is stable
requestAnimationFrame(() => {
  drawThreadLines();
});

window.addEventListener("resize", drawThreadLines);
