import React from 'react';
import Chart from 'react-apexcharts';
import { PieChart as PieIcon } from 'lucide-react'; // 👈 uses lucide-react icon

export interface PieChartData {
    name: string;
    value: number;
}

interface PieChartProps {
    title?: string;
    data: PieChartData[];
    colors?: string[];
    height?: number | string;
    showLegend?: boolean;
    donut?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ 
    title, 
    data, 
    colors = [
        '#1E90FF', 
        '#FFCD56', 
        '#4CAF50', 
        '#FF7043', 
        '#9C27B0'
    ], height = 350, 
    showLegend = true, 
    donut = false 
}) => {
    const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'pie',
            background: 'transparent',
        },
        labels: hasData ? data.map((item) => item.name) : [],
        colors,
        legend: {
            show: hasData && showLegend,
            position: 'bottom',
            labels: { colors: '#6B7280' },
        },
        title: {
            text: title,
            align: 'center',
            style: {
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827',
            },
        },
        dataLabels: {
            enabled: hasData,
            formatter: (val: number) => `${val.toFixed(1)}%`,
        },
        tooltip: {
            enabled: hasData,
            y: {
                formatter: (val: number) => val.toLocaleString(),
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: donut ? '60%' : '0%',
                    labels: { show: false },
                },
            },
        },
    };

    const series = hasData ? data.map((item) => item.value) : [];

    return (
        <div style={{ height }}>
            {hasData ? (
                <Chart 
                    options={options} 
                    series={series} 
                    type="pie" 
                    height={height} 
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                        <PieIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-lg font-semibold">No Data Available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">There’s nothing to show yet. Try adding some data!</p>
                </div>
            )}
        </div>
    );
};

export default PieChart;
