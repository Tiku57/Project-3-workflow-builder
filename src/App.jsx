// src/App.jsx
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Node from './Node';
import { calculateBezierPath, hasCycle } from './utils';

const App = () => {
  // STATE MANAGEMENT
  const [nodes, setNodes] = useState([
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Start Trigger', type: 'trigger' } },
    { id: '2', position: { x: 400, y: 200 }, data: { label: 'Send Email', type: 'action' } },
  ]);
  
  const [connections, setConnections] = useState([]);
  
  // Temporary state for drawing a new line
  const [drawingLine, setDrawingLine] = useState(null); 

  // Refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null); // Reference to the hidden file input

  // --- ACTIONS ---

  // 1. Update Node Position
  const handleNodeDrag = (id, x, y) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, position: { x, y } } : node))
    );
  };

  // 2. Start connecting
  const handleConnectStart = (sourceId, e) => {
    const { clientX, clientY } = e;
    const sourceNode = nodes.find((n) => n.id === sourceId);
    
    const startX = sourceNode.position.x + 192; 
    const startY = sourceNode.position.y + 55; 

    setDrawingLine({ sourceId, startX, startY, currX: clientX, currY: clientY });
  };

  // 3. Track mouse
  const handleMouseMove = (e) => {
    if (!drawingLine) return;
    setDrawingLine((prev) => ({
      ...prev,
      currX: e.clientX,
      currY: e.clientY,
    }));
  };

  // 4. Finish connecting
  const handleConnectEnd = (targetId) => {
    if (!drawingLine) return;
    const { sourceId } = drawingLine;

    if (sourceId === targetId) {
        setDrawingLine(null);
        return;
    }

    if (hasCycle(nodes, connections, sourceId, targetId)) {
      alert("Error: Cyclic dependency detected!");
      setDrawingLine(null);
      return;
    }

    setConnections((prev) => [
      ...prev,
      { id: uuidv4(), source: sourceId, target: targetId },
    ]);
    
    setDrawingLine(null);
  };

  const handleCanvasClick = () => {
    setDrawingLine(null);
  };

  const addNode = () => {
    const newNode = {
        id: uuidv4(),
        position: { x: 50, y: 50 },
        data: { label: 'New Action', type: 'process' }
    };
    setNodes([...nodes, newNode]);
  };

  // --- EXPORT & IMPORT LOGIC ---

  const exportJSON = () => {
    const data = JSON.stringify({ nodes, connections }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
  };

  const triggerImport = () => {
    fileInputRef.current.click(); // Programmatically click the hidden input
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.nodes && json.connections) {
          setNodes(json.nodes);
          setConnections(json.connections);
          alert("Workflow loaded successfully!");
        } else {
          alert("Invalid file format: Missing nodes or connections.");
        }
      } catch (error) {
        alert("Error parsing JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input so you can load the same file again if needed
    event.target.value = '';
  };

  // --- RENDERING ---

  return (
    <div 
      className="w-screen h-screen bg-[#111] relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleCanvasClick}
      ref={canvasRef}
    >
      {/* UI Controls */}
      <div className="absolute top-4 left-4 z-50 flex gap-4">
        <button onClick={addNode} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow cursor-pointer">
          + Add Node
        </button>
        <button onClick={exportJSON} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow cursor-pointer">
          Export JSON
        </button>
        <button onClick={triggerImport} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow cursor-pointer">
          Import JSON
        </button>
        
        {/* Hidden File Input for Import */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json" 
          onChange={handleImport} 
        />
      </div>

      {/* SVG Layer for Wires */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {connections.map((conn) => {
          const source = nodes.find((n) => n.id === conn.source);
          const target = nodes.find((n) => n.id === conn.target);
          if (!source || !target) return null;

          const start = { x: source.position.x + 192, y: source.position.y + 55 };
          const end = { x: target.position.x, y: target.position.y + 55 };

          return (
            <path
              key={conn.id}
              d={calculateBezierPath(start, end)}
              stroke="#555"
              strokeWidth="3"
              fill="transparent"
            />
          );
        })}

        {drawingLine && (
          <path
            d={calculateBezierPath(
              { x: drawingLine.startX, y: drawingLine.startY },
              { x: drawingLine.currX, y: drawingLine.currY }
            )}
            stroke="#3b82f6" 
            strokeWidth="3"
            strokeDasharray="5,5" 
            fill="transparent"
          />
        )}
      </svg>

      {/* HTML Layer for Nodes */}
      <div className="relative z-10 w-full h-full">
        {nodes.map((node) => (
          <Node
            key={node.id}
            {...node}
            onDrag={handleNodeDrag}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default App;