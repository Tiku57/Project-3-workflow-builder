import React, { useRef } from 'react';
import Draggable from 'react-draggable';

const Node = ({ id, data, position, onDrag, onConnectStart, onConnectEnd, isSelected }) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onDrag={(e, data) => onDrag(id, data.x, data.y)}
      onMouseDown={(e) => e.stopPropagation()} 
    >
      <div
        ref={nodeRef}
        className={`absolute w-48 bg-gray-800 rounded-lg shadow-xl border-2 ${
          isSelected ? 'border-blue-500' : 'border-gray-600'
        } flex flex-col`}
        style={{ cursor: 'grab' }}
      >
        <div className="bg-gray-700 p-2 rounded-t-lg border-b border-gray-600 text-white font-bold text-sm">
          {data.label}
        </div>

        <div className="p-4 relative">
          <p className="text-gray-300 text-xs">Function: {data.type}</p>
          
          {/* Input Port (Left) */}
          <div
            className="absolute left-[-8px] top-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-crosshair hover:scale-125 transition-transform border-2 border-white"
            style={{ transform: 'translateY(-50%)' }}
            onMouseUp={(e) => {
                e.stopPropagation();
                onConnectEnd(id);
            }}
            title="Input"
          />

          {/* Output Port (Right) */}
          <div
            className="absolute right-[-8px] top-1/2 w-4 h-4 bg-green-500 rounded-full cursor-crosshair hover:scale-125 transition-transform border-2 border-white"
            style={{ transform: 'translateY(-50%)' }}
            onMouseDown={(e) => {
                e.stopPropagation();
                onConnectStart(id, e);
            }}
            title="Output"
          />
        </div>
      </div>
    </Draggable>
  );
};

export default Node;