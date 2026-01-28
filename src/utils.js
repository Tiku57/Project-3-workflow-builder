// CHALLENGE #1: SVG/Canvas Wiring - Calculate Bezier Curves
export const calculateBezierPath = (startPos, endPos) => {
  const { x: x1, y: y1 } = startPos;
  const { x: x2, y: y2 } = endPos;

  const dist = Math.abs(x2 - x1);
  const curvature = Math.max(dist * 0.5, 50); 

  const cp1x = x1 + curvature;
  const cp1y = y1;
  const cp2x = x2 - curvature;
  const cp2y = y2;

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
};

// CHALLENGE #2: Cyclic Dependency Check
export const hasCycle = (nodes, connections, sourceId, targetId) => {
  const visited = new Set();
  const stack = [targetId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId === sourceId) return true; 

    const outgoingConnections = connections.filter(c => c.source === currentId);
    outgoingConnections.forEach(conn => stack.push(conn.target));
  }
  return false;
};