import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface GroundingChunk {
  maps: {
    title: string;
    uri: string;
    placeAnswerSources?: { reviewSnippets?: { uri: string; text: string }[] }[];
  };
}

interface LocationMapProps {
  queryType: 'pos' | 'server';
}

const LocationMap: React.FC<LocationMapProps> = ({ queryType }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [locations, setLocations] = useState<GroundingChunk[]>([]);

  const contentConfig = {
    pos: {
      prompt: "List all good restaurants in Nairobi",
      loadingText: "Fetching restaurant data for Nairobi...",
      header: "Restaurants Found:",
      errorText: "Failed to fetch restaurant data. Please try again later.",
      notFoundText: "No specific restaurant locations were found in the response."
    },
    server: {
      prompt: "List all events happening in Nairobi",
      loadingText: "Fetching event data for Nairobi...",
      header: "Events Found:",
      errorText: "Failed to fetch event data. Please try again later.",
      notFoundText: "No specific event locations were found in the response."
    }
  };

  const currentConfig = contentConfig[queryType];

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!process.env.API_KEY) {
          throw new Error("API key is not configured.");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Use Nairobi coordinates as requested
        const nairobiCoords = {
          latitude: -1.286389,
          longitude: 36.817223
        };

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: currentConfig.prompt,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: nairobiCoords,
              }
            }
          },
        });
        
        const text = response.text;
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        // Filter for chunks that actually contain map data
        const mapChunks = chunks.filter((chunk: any) => chunk.maps && chunk.maps.uri);

        setSummary(text);
        setLocations(mapChunks);
      } catch (err: any) {
        console.error("Error fetching location data:", err);
        setError(currentConfig.errorText);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [queryType, currentConfig]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg">{currentConfig.loadingText}</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center p-8">{error}</p>;
  }

  return (
    <div className="w-full max-w-3xl p-4 bg-slate-800 rounded-lg shadow-lg">
      <div className="prose prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
      <h3 className="text-xl font-bold mt-6 mb-4 border-b border-slate-600 pb-2">{currentConfig.header}</h3>
      {locations.length > 0 ? (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {locations.map((loc, index) => (
            <li key={`${loc.maps.uri}-${index}`} className="bg-slate-700 p-3 rounded-md hover:bg-slate-600 transition-colors">
              <a href={loc.maps.uri} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-400 hover:underline">
                {loc.maps.title}
              </a>
              {loc.maps.placeAnswerSources?.map(source => 
                source.reviewSnippets?.map((snippet, sIndex) => (
                   <a key={sIndex} href={snippet.uri} target="_blank" rel="noopener noreferrer" className="block mt-1 text-sm text-slate-400 italic hover:text-slate-300">
                     "{snippet.text}"
                   </a>
                ))
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>{currentConfig.notFoundText}</p>
      )}
    </div>
  );
};

export default LocationMap;