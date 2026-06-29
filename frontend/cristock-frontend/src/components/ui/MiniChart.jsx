import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniChart({ data, isPositive }) {
  const color = isPositive ? '#00FF87' : '#FF4757';
  
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}