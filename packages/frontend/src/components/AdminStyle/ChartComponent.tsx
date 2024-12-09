import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface ChartComponentProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, options }) => {
  return <Bar data={data} options={options} />;
};

export default ChartComponent;
