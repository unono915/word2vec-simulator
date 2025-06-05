
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer, Legend, Symbols } from 'recharts';
import type { RelatedWord } from '../types';

interface WordPlotProps {
  data: RelatedWord[];
  width: number;
  height: number;
  targetWord: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-md border border-slate-200">
        <p className="font-semibold text-sky-700">{data.word}</p>
        <p className="text-sm text-slate-600">{`x: ${data.x}, y: ${data.y}`}</p>
      </div>
    );
  }
  return null;
};

// Custom shape renderer for the target word (star)
const RenderStar: React.FC<any> = (props) => {
  const { cx, cy, fill, payload } = props;
  // The size was intended to be 100.
  // Symbols component takes cx, cy, type, size, fill, stroke.
  return <Symbols cx={cx} cy={cy} type="star" size={100} fill={fill} />;
};


const WordPlot: React.FC<WordPlotProps> = ({ data, width, height, targetWord }) => {
  if (!data || data.length === 0) {
    return <p className="text-slate-500">표시할 데이터가 없습니다.</p>;
  }
  
  const targetWordData = data.filter(d => d.word.toLowerCase() === targetWord.toLowerCase());
  const otherWordsData = data.filter(d => d.word.toLowerCase() !== targetWord.toLowerCase());


  // Determine axis domains dynamically with padding
  const allX = data.map(d => d.x);
  const allY = data.map(d => d.y);
  const minX = Math.min(...allX, -50); // Ensure at least -50
  const maxX = Math.max(...allX, 50);   // Ensure at least 50
  const minY = Math.min(...allY, -50);
  const maxY = Math.max(...allY, 50);

  const padding = 10; // Or a percentage of the range
  const xDomain: [number, number] = [Math.floor(minX - padding), Math.ceil(maxX + padding)];
  const yDomain: [number, number] = [Math.floor(minY - padding), Math.ceil(maxY + padding)];


  return (
    <ResponsiveContainer width="100%" height={height} minWidth={300} minHeight={300}>
      <ScatterChart
        margin={{
          top: 30, // Increased top margin for labels
          right: 30, // Increased right margin for labels
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="X" 
          domain={xDomain} 
          tick={{ fontSize: 10, fill: '#666' }} 
          stroke="#999"
          label={{ value: 'X축', position: 'insideBottomRight', offset: -10, fontSize: 12, fill: '#555' }}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Y" 
          domain={yDomain} 
          tick={{ fontSize: 10, fill: '#666' }} 
          stroke="#999"
          label={{ value: 'Y축', angle: -90, position: 'insideLeft', offset: -5, fontSize: 12, fill: '#555' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#8884d8' }}/>
        <Legend verticalAlign="top" height={36}/>
        
        <Scatter name="관련 단어" data={otherWordsData} fill="#8884d8" shape="circle" >
           <LabelList 
            dataKey="word" 
            position="top" 
            offset={8}
            style={{ fill: '#555', fontSize: '11px', fontWeight: 'normal' }} 
            formatter={(value: string) => value.length > 10 ? `${value.substring(0,9)}...` : value}
           />
        </Scatter>
        {targetWordData.length > 0 && (
          <Scatter name="입력 단어" data={targetWordData} fill="#ff7300" shape={RenderStar}>
             <LabelList 
              dataKey="word" 
              position="top" 
              offset={10}
              style={{ fill: '#d95f00', fontSize: '13px', fontWeight: 'bold' }}
              formatter={(value: string) => value.length > 10 ? `${value.substring(0,9)}...` : value}
             />
          </Scatter>
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default WordPlot;
