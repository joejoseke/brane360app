import React, { useState, useEffect, useMemo } from 'react';
import { ROOT_NODE } from './constants';
import { NodeData } from './types';
import MapLayout from './components/MapLayout';
import LocationMap from './components/LocationMap';
import SearchBar from './components/SearchBar';

export interface SearchableNode {
  node: NodeData;
  path: NodeData[]; // path of ancestors
  breadcrumb: string;
}

const App: React.FC = () => {
  const [activeNode, setActiveNode] = useState<NodeData>(ROOT_NODE);
  const [history, setHistory] = useState<NodeData[]>([]);
  const [isFading, setIsFading] = useState<boolean>(false);

  const allNodes = useMemo(() => {
    const flattened: SearchableNode[] = [];
    const traverse = (node: NodeData, ancestors: NodeData[]) => {
        // Don't add the root node itself to searchable list, only its descendants
        if (node.id !== 'root') {
             const breadcrumb = ancestors.slice(1).map(n => n.title).join(' > ');
             flattened.push({ node, path: ancestors, breadcrumb });
        }
       
        if (node.subNodes) {
            const newAncestors = [...ancestors, node];
            node.subNodes.forEach(subNode => traverse(subNode, newAncestors));
        }
    };
    traverse(ROOT_NODE, []); // Start with an empty ancestor path
    return flattened;
  }, []);

  const handleNodeClick = (node: NodeData) => {
    // Handle external links first
    if (node.externalLink) {
      window.open(node.externalLink, '_blank', 'noopener,noreferrer');
      return;
    }

    // Special cases for grounding maps
    if (node.id === 'pos' || node.id === 'server') {
      setIsFading(true);
      setTimeout(() => {
        setHistory([...history, activeNode]);
        setActiveNode(node);
        setIsFading(false);
      }, 500);
      return;
    }
    
    // Default behavior for nodes with sub-nodes
    if (!node.subNodes || node.subNodes.length === 0) return;

    setIsFading(true);
    setTimeout(() => {
      setHistory([...history, activeNode]);
      setActiveNode(node);
      setIsFading(false);
    }, 500);
  };
  
  const handleSearchSelect = (searchResult: SearchableNode) => {
    setIsFading(true);
    setTimeout(() => {
        setHistory(searchResult.path);
        setActiveNode(searchResult.node);
        setIsFading(false);
    }, 500);
  };

  const handleBackClick = () => {
    if (history.length === 0) return;

    setIsFading(true);
    setTimeout(() => {
      const previousNode = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setActiveNode(previousNode);
      setIsFading(false);
    }, 500);
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeNode]);

  return (
    <div className="min-h-screen w-full bg-slate-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 transition-colors duration-500 overflow-x-hidden">
      <header className="w-full max-w-5xl mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 pb-2">
            Brane360 Strategic Intelligence
            </h1>
        </div>
        <SearchBar nodes={allNodes} onSelect={handleSearchSelect} />
      </header>
      
      <main className={`w-full max-w-5xl flex-grow flex flex-col items-center justify-center transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full flex flex-col items-center">
          {history.length > 0 && (
            <button 
              onClick={handleBackClick} 
              className="mb-8 flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors self-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          )}
          {activeNode.id !== 'root' && (
            <div className="text-center mb-10">
                <h2 className={`text-3xl font-bold`}>{activeNode.title}</h2>
                {activeNode.description && <p className="text-slate-400 mt-2 max-w-2xl mx-auto">{activeNode.description}</p>}
            </div>
          )}
          {(activeNode.id === 'pos' || activeNode.id === 'server') ? (
            <LocationMap queryType={activeNode.id as 'pos' | 'server'} />
           ) : (
            <MapLayout
              centerNode={{ title: activeNode.title, imageUrl: activeNode.imageUrl || '' }}
              orbitingNodes={activeNode.subNodes || []}
              onNodeClick={handleNodeClick}
            />
           )}
        </div>
      </main>
      <footer className="w-full max-w-5xl text-center mt-12 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Branevalley. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;