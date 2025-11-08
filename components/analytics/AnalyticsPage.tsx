

import React, { useMemo } from 'react';
import { Trade } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, ReferenceLine } from 'recharts';

const MetricCard: React.FC<{ title: string, value: string | number, className?: string }> = ({ title, value, className }) => (
    <div className={`bg-brand-dark-blue p-4 rounded-lg shadow-lg ${className}`}>
        <h3 className="text-brand-gray text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-brand-light-blue p-2 border border-brand-gray/50 rounded-md">
                <p className="label text-white">{`${label}`}</p>
                <p className="intro text-brand-profit">{`Profit: ${payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>
                <p className="intro text-brand-loss">{`Loss: ${payload[1].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>
            </div>
        );
    }
    return null;
};

const CustomEquityTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-brand-light-blue p-3 border border-brand-gray/50 rounded-lg shadow-lg">
                <p className="text-sm text-brand-gray">{`${label}`}</p>
                <p className="text-lg font-bold text-white">
                    Balance: {payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
            </div>
        );
    }
    return null;
};

export const AnalyticsPage: React.FC<{ trades: Trade[] }> = ({ trades }) => {
    const analyticsData = useMemo(() => {
        if (trades.length === 0) {
            return {
                totalPnl: 0,
                winRate: 0,
                averageWin: 0,
                averageLoss: 0,
                profitFactor: 0,
                totalTrades: 0,
                winLossData: [],
                dailyPnlData: [],
                equityCurveData: [],
                top5Best: [],
                top5Worst: [],
            };
        }

        const sortedByDate = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const wins = sortedByDate.filter(t => t.pnl > 0);
        const losses = sortedByDate.filter(t => t.pnl < 0);
        
        const totalPnl = sortedByDate.reduce((acc, t) => acc + t.pnl, 0);
        const totalProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
        const totalLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));

        const winRate = sortedByDate.length > 0 ? (wins.length / sortedByDate.length) * 100 : 0;
        const averageWin = wins.length > 0 ? totalProfit / wins.length : 0;
        const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0;
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
        
        const winLossData = [{ name: 'Wins', value: wins.length }, { name: 'Losses', value: losses.length }];
        
        const dailyPnl: { [key: string]: { profit: number, loss: number } } = {};
        sortedByDate.forEach(t => {
            const dateKey = new Date(t.date).toLocaleDateString();
            if (!dailyPnl[dateKey]) dailyPnl[dateKey] = { profit: 0, loss: 0 };
            if(t.pnl > 0) dailyPnl[dateKey].profit += t.pnl;
            else dailyPnl[dateKey].loss += Math.abs(t.pnl);
        });
        const dailyPnlData = Object.entries(dailyPnl).map(([date, data]) => ({ date, ...data }));
        
        let cumulativePnl = 0;
        const equityCurveData = sortedByDate.map((t, index) => {
            cumulativePnl += t.pnl;
            return { name: `Trade ${index + 1}`, balance: cumulativePnl };
        });

        const sortedByPnl = [...trades].sort((a, b) => b.pnl - a.pnl);
        const top5Best = sortedByPnl.slice(0, 5);
        const top5Worst = sortedByPnl.slice(-5).reverse();

        return {
            totalPnl, winRate, averageWin, averageLoss, profitFactor, totalTrades: trades.length,
            winLossData, dailyPnlData, equityCurveData, top5Best, top5Worst
        };
    }, [trades]);

    const COLORS_WIN_LOSS = ['#10B981', '#F43F5E'];

    if (trades.length === 0) {
        return <div className="text-center text-brand-gray text-2xl mt-20">Log some trades to see your analytics.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-poppins text-white">Performance Analytics</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard title="Total P/L" value={analyticsData.totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} className={analyticsData.totalPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}/>
                <MetricCard title="Win Rate" value={`${analyticsData.winRate.toFixed(2)}%`} />
                <MetricCard title="Profit Factor" value={analyticsData.profitFactor.toFixed(2)} />
                <MetricCard title="Average Win" value={analyticsData.averageWin.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} className="text-brand-profit" />
                <MetricCard title="Average Loss" value={analyticsData.averageLoss.toLocaleString('en-US', { style: 'currency', 'currency': 'USD' })} className="text-brand-loss" />
                <MetricCard title="Total Trades" value={analyticsData.totalTrades} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="bg-brand-dark-blue p-4 rounded-xl shadow-lg lg:col-span-2">
                    <h2 className="font-bold text-white mb-4">Equity Curve</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.equityCurveData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                </linearGradient>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3041" />
                            <XAxis dataKey="name" stroke="#8a91a0" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#8a91a0" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomEquityTooltip />} cursor={{ stroke: '#8a91a0', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <ReferenceLine y={0} stroke="#8a91a0" strokeDasharray="4 4" />
                            <Area type="monotone" dataKey="balance" fill="url(#balanceGradient)" stroke={false} />
                            <Line 
                                type="monotone" 
                                dataKey="balance" 
                                stroke="#3B82F6" 
                                strokeWidth={2.5} 
                                dot={false}
                                filter="url(#glow)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-brand-dark-blue p-4 rounded-xl shadow-lg">
                    <h2 className="font-bold text-white mb-4">Win Rate</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={analyticsData.winLossData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                {analyticsData.winLossData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_WIN_LOSS[index % COLORS_WIN_LOSS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e2230', border: '1px solid #2a3041' }} itemStyle={{ color: '#e5e7eb' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-brand-dark-blue p-4 rounded-xl shadow-lg lg:col-span-3">
                    <h2 className="font-bold text-white mb-4">Daily P/L</h2>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={analyticsData.dailyPnlData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a3041" />
                            <XAxis dataKey="date" stroke="#8a91a0" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#8a91a0" tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="profit" stackId="a" fill="#10B981" />
                            <Bar dataKey="loss" stackId="a" fill="#F43F5E" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TradesTable title="Top 5 Best Trades" trades={analyticsData.top5Best} />
                <TradesTable title="Top 5 Worst Trades" trades={analyticsData.top5Worst} />
            </div>
        </div>
    );
};


const TradesTable: React.FC<{ title: string; trades: Trade[] }> = ({ title, trades }) => (
    <div className="bg-brand-dark-blue p-4 rounded-xl shadow-lg">
        <h2 className="font-bold text-white mb-4">{title}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-brand-light-blue/50">
                    <tr>
                        <th scope="col" className="px-4 py-2">Symbol</th>
                        <th scope="col" className="px-4 py-2">Date</th>
                        <th scope="col" className="px-4 py-2 text-right">P/L</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map(trade => (
                        <tr key={trade.id} className="border-b border-brand-light-blue/30 hover:bg-brand-light-blue/40">
                            <td className="px-4 py-2 font-medium text-white whitespace-nowrap">{trade.symbol}</td>
                            <td className="px-4 py-2">{new Date(trade.date).toLocaleDateString()}</td>
                            <td className={`px-4 py-2 font-bold text-right ${trade.pnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                                {trade.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);