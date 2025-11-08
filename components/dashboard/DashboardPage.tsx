

import React, { useState, useMemo } from 'react';
import { Trade, DailySummary, WeeklySummary } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const getDaysInMonth = (year: number, month: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

interface CalendarDayCardProps {
    day: number;
    summary: DailySummary | null;
    isToday: boolean;
    onClick: () => void;
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({ day, summary, isToday, onClick }) => {
    const pnl = summary?.pnl ?? 0;
    const isProfit = pnl > 0;
    const isLoss = pnl < 0;

    const cardBg = isProfit ? 'bg-green-500/10' : isLoss ? 'bg-red-500/10' : 'bg-brand-light-blue/50';
    const textColor = isProfit ? 'text-brand-profit' : isLoss ? 'text-brand-loss' : 'text-gray-200';
    const borderColor = isProfit ? 'border-brand-profit/30' : isLoss ? 'border-brand-loss/30' : 'border-transparent';
    const todayIndicator = isToday ? 'ring-2 ring-brand-accent' : '';

    return (
        <button 
            onClick={onClick}
            className={`h-28 md:h-32 flex flex-col p-2 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-brand-light-blue/80 border text-left ${cardBg} ${borderColor} ${todayIndicator}`}
            aria-label={`View or add trades for day ${day}`}
        >
            <span className={`font-medium ${isToday ? 'text-brand-accent' : 'text-gray-400'}`}>{day}</span>
            {summary && (
                <div className="flex flex-col justify-end flex-grow mt-2">
                    <p className={`font-bold text-sm md:text-base ${textColor}`}>
                        {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    <p className="text-xs text-brand-gray">{summary.tradeCount} trade{summary.tradeCount !== 1 ? 's' : ''}</p>
                </div>
            )}
        </button>
    );
};

export const DashboardPage: React.FC<{ trades: Trade[], onDateSelect: (date: Date) => void }> = ({ trades, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { dailySummaries, monthlyPnl, currentWeekPnl } = useMemo(() => {
        const summaries: { [key: string]: DailySummary } = {};
        trades.forEach(trade => {
            const tradeDate = new Date(trade.date);
            if (tradeDate.getFullYear() === currentDate.getFullYear() && tradeDate.getMonth() === currentDate.getMonth()) {
                const dayKey = tradeDate.toISOString().split('T')[0];
                if (!summaries[dayKey]) {
                    summaries[dayKey] = { date: tradeDate, pnl: 0, tradeCount: 0 };
                }
                summaries[dayKey].pnl += trade.pnl;
                summaries[dayKey].tradeCount++;
            }
        });
        
        const dailySummaries = Object.values(summaries);
        
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const weekly: { [week: number]: { pnl: number, tradeCount: number } } = {};
        
        dailySummaries.forEach(day => {
            const dayOfMonth = day.date.getDate();
            const weekOfMonth = Math.floor((dayOfMonth - 1 + firstDayOfMonth) / 7) + 1;
            
            if (!weekly[weekOfMonth]) {
                weekly[weekOfMonth] = { pnl: 0, tradeCount: 0 };
            }
            weekly[weekOfMonth].pnl += day.pnl;
            weekly[weekOfMonth].tradeCount += day.tradeCount;
        });

        const weeklySummaries = Object.entries(weekly).map(([week, data]) => ({
            week: parseInt(week, 10),
            pnl: data.pnl,
            tradeCount: data.tradeCount
        })).sort((a,b) => a.week - b.week);
        
        const monthlyPnl = dailySummaries.reduce((acc, curr) => acc + curr.pnl, 0);

        const today = new Date();
        let currentWeekPnl = 0;
        // Calculate current week P/L only if we are viewing the current month
        if (today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth()) {
            const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
            const currentWeekNumber = Math.floor((today.getDate() - 1 + firstDayOfThisMonth) / 7) + 1;
            const currentWeekData = weeklySummaries.find(w => w.week === currentWeekNumber);
            currentWeekPnl = currentWeekData ? currentWeekData.pnl : 0;
        }

        return { dailySummaries, weeklySummaries, monthlyPnl, currentWeekPnl };
    }, [trades, currentDate]);


    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDayOfMonth = daysInMonth[0].getDay();
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const goToToday = () => setCurrentDate(new Date());
    const today = new Date();

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-md bg-brand-light-blue hover:bg-brand-accent transition-colors"><ChevronLeftIcon className="h-5 w-5"/></button>
                    <h1 className="text-2xl font-bold font-poppins text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-md bg-brand-light-blue hover:bg-brand-accent transition-colors"><ChevronRightIcon className="h-5 w-5"/></button>
                     <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold rounded-md bg-brand-light-blue hover:bg-brand-accent transition-colors">Today</button>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-brand-dark-blue p-3 rounded-lg shadow-lg text-right">
                        <span className="text-sm text-brand-gray">This Week's P/L: </span>
                        <span className={`text-xl font-bold ${currentWeekPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                            {currentWeekPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </span>
                    </div>
                     <div className="bg-brand-dark-blue p-3 rounded-lg shadow-lg text-right">
                        <span className="text-sm text-brand-gray">Monthly P/L: </span>
                        <span className={`text-xl font-bold ${monthlyPnl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                            {monthlyPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </span>
                    </div>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-4 bg-brand-dark-blue p-4 rounded-xl shadow-2xl">
                    <div className="grid grid-cols-7 gap-2 text-center text-brand-gray font-medium mb-2">
                        {weekdays.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                        {daysInMonth.map(date => {
                             const daySummary = dailySummaries.find(s => new Date(s.date).toDateString() === date.toDateString());
                             const isToday = today.getFullYear() === date.getFullYear() &&
                                           today.getMonth() === date.getMonth() &&
                                           today.getDate() === date.getDate();
                             return <CalendarDayCard 
                                        key={date.toString()} 
                                        day={date.getDate()} 
                                        summary={daySummary ?? null} 
                                        isToday={isToday} 
                                        onClick={() => onDateSelect(date)}
                                    />;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
