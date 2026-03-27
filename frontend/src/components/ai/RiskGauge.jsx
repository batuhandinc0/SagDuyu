import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RiskGauge = ({ score }) => {
    // Score is between 0 and 1
    const percentage = Math.round(score * 100);

    const data = [
        { name: 'Risk', value: percentage },
        { name: 'Safe', value: 100 - percentage },
    ];

    // Determine color based on risk
    let color = '#10b981'; // Green
    if (percentage > 30) color = '#f59e0b'; // Orange
    if (percentage > 70) color = '#ef4444'; // Red

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-text-main dark:text-text-inverse mb-4">Risk Analizi</h3>
            <div className="w-48 h-24 relative overflow-hidden">
                <ResponsiveContainer width="100%" height="200%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="risk" fill={color} />
                            <Cell key="safe" fill="#e2e8f0" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 left-0 w-full text-center">
                    <span className="text-3xl font-bold" style={{ color }}>%{percentage}</span>
                </div>
            </div>
            <p className="mt-4 text-sm font-medium text-text-secondary dark:text-text-light">
                {percentage < 30 ? 'Düşük Risk' : percentage < 70 ? 'Orta Risk' : 'Yüksek Risk'}
            </p>
        </div>
    );
};

export default RiskGauge;
