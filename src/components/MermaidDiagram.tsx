import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

interface MermaidProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      if (!chart) return;
      setLoading(true);
      setError(null);
      
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        // Clean the chart code to ensure it's valid mermaid
        let cleanChart = chart.trim();
        if (!cleanChart.startsWith('flowchart') && 
            !cleanChart.startsWith('graph') && 
            !cleanChart.startsWith('mindmap') &&
            !cleanChart.startsWith('classDiagram')) {
          cleanChart = `flowchart TD\n${cleanChart}`;
        }

        const { svg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
          setError("تعذر تحميل الرسم التوضيحي. قد يكون هناك خطأ في تنسيق الكود المولد.");
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (loading && !svgContent) {
    return (
      <div className="flex items-center justify-center p-12 text-[#999] animate-pulse font-serif italic">
        جاري رسم المخطط الهيكلي...
      </div>
    );
  }

  if (error && !svgContent) {
    return (
      <div className="p-8 text-center border border-dashed border-[#8B2635]/30 rounded-sm bg-[#8B2635]/5">
        <p className="text-[#8B2635] font-serif">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center w-full overflow-x-auto bg-transparent rounded-sm py-4"
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
};
