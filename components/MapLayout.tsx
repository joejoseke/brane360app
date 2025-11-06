import React from 'react';
import BraneCircle from './BraneCircle';
import { NodeData } from '../types';

interface MapLayoutProps {
  centerNode: { title: string; imageUrl: string };
  orbitingNodes: NodeData[];
  onNodeClick: (node: NodeData) => void;
}

const MapLayout: React.FC<MapLayoutProps> = ({ centerNode, orbitingNodes, onNodeClick }) => {
  const nodeCount = orbitingNodes.length;
  // An orbiting node is a leaf if it has no subNodes. This determines if we render an outer ring.
  const isOuterRingView = orbitingNodes.length > 0 && (!orbitingNodes[0].subNodes || orbitingNodes[0].subNodes.length === 0);

  return (
    <div className="relative w-[90vw] h-[90vw] sm:w-[80vw] sm:h-[80vw] md:w-[70vw] md:h-[70vw] lg:w-[50vw] lg:h-[50vw] flex items-center justify-center">
      {/* SVG Lines for Connections */}
      <svg className="absolute inset-0 w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        {orbitingNodes.map((_, index) => {
          const angle = (index / nodeCount) * 2 * Math.PI;
          // Use a smaller radius for inner nodes and larger for outer to avoid overlap
          const radius = isOuterRingView ? 48 : 42;
          const lineX2 = 50 + radius * Math.cos(angle);
          const lineY2 = 50 + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1="50%"
              y1="50%"
              x2={`${lineX2}%`}
              y2={`${lineY2}%`}
              className="stroke-slate-700"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      
      {/* Center Node with Blue Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-1.5 bg-blue-500 rounded-full shadow-2xl">
        <div 
          className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center text-center p-4 bg-slate-800 bg-cover bg-center border-2 border-slate-600"
          style={{ backgroundImage: `url(${centerNode.imageUrl})` }}
        >
          <div className="w-full h-full flex items-center justify-center rounded-full bg-black/60 p-2">
            <h3 className="text-lg md:text-xl font-bold text-white">{centerNode.title}</h3>
          </div>
        </div>
      </div>
      
      {/* Orbiting Nodes */}
      {orbitingNodes.map((node, index) => {
        const angle = (index / nodeCount) * 2 * Math.PI - (Math.PI / 2); // Start from the top

        if (isOuterRingView) {
          // Render as Outer Ring Node (Leaf Node)
          const circleRadiusPercent = 42; // Radius for the hollow circle
          const textAnchorRadiusPercent = 46; // Radius for positioning the text's anchor point
          
          const circleX = 50 + circleRadiusPercent * Math.cos(angle);
          const circleY = 50 + circleRadiusPercent * Math.sin(angle);
          
          const textX = 50 + textAnchorRadiusPercent * Math.cos(angle);
          const textY = 50 + textAnchorRadiusPercent * Math.sin(angle);
          
          const rotation = (angle * 180 / Math.PI) + 90;

          return (
            <button
              key={node.id}
              onClick={() => onNodeClick(node)}
              className="contents group"
              aria-label={`Explore ${node.title}`}
            >
              <React.Fragment>
                {/* Hollow Circle */}
                <div
                  className="absolute z-20 w-5 h-5 rounded-full bg-slate-200 border-2 border-slate-400 group-hover:bg-white group-hover:border-cyan-400 transition-all duration-200"
                  style={{
                    top: `${circleY}%`,
                    left: `${circleX}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                {/* Rotated Text Label */}
                <div
                  className="absolute z-20 h-20" // Give height for rotation alignment
                  style={{
                    top: `${textY}%`,
                    left: `${textX}%`,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <span className="block text-slate-300 text-xs md:text-sm whitespace-nowrap group-hover:text-cyan-300 transition-colors duration-200">
                    {node.title}
                  </span>
                </div>
              </React.Fragment>
            </button>
          );
        } else {
          // Render as Inner Ring Node (Branch Node)
          const radiusPercent = 42;
          const x = 50 + radiusPercent * Math.cos(angle);
          const y = 50 + radiusPercent * Math.sin(angle);
          return (
            <div
              key={node.id}
              className="absolute z-20"
              style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
            >
              <BraneCircle title={node.title} onClick={() => onNodeClick(node)} />
            </div>
          );
        }
      })}
    </div>
  );
};

export default MapLayout;