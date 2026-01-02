import React from 'react';
import Chart from 'react-apexcharts';

export interface BarChartSeries {
    name: string;
    data: number[];
}

interface BarChartProps {
    title?: string;
    categories: string[];
    series: BarChartSeries[];
    colors?: string[];
    height?: number | string;
    showLegend?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
    title,
    categories,
    series,
    colors = ['#FACC15', '#3B82F6', '#22C55E'], // yellow, blue, green
    height = 400,
    showLegend = true,
}) => {
    const hasData = series && series.length > 0 && series.some((s) => s.data.some((v) => v > 0));

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            background: 'transparent',
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 6,
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        colors,
        xaxis: {
            categories,
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '13px',
                    fontWeight: 500,
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#6B7280',
                    fontSize: '13px',
                },
            },
        },
        legend: {
            show: showLegend,
            position: 'bottom',
            labels: { colors: '#6B7280' },
        },
        grid: {
            borderColor: '#E5E7EB',
            strokeDashArray: 4,
        },
        tooltip: {
            y: {
                formatter: (val: number) => val.toLocaleString(),
            },
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
        noData: {
            text: 'No data available',
            align: 'center',
            verticalAlign: 'middle',
            style: {
                color: '#9CA3AF',
                fontSize: '16px',
            },
        },
    };

    return (
        <div style={{ height }}>
            {hasData ? (
                <Chart 
                    options={options} 
                    series={series} 
                    type="bar" 
                    height={height} 
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">📊</div>
                    <p className="text-lg font-semibold">No Data Available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">There’s nothing to show yet. Try adding some data!</p>
                </div>
            )}
        </div>
    );
};

export default BarChart;
