import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { JournalPage } from './components/journal/JournalPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { DayJournalPage } from './components/journal/DayJournalPage';
import { Trade } from './types';

type Page = 'dashboard' | 'journal' | 'analytics' | 'day-journal';

function App() {
  const { isAuthenticated, trades, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);


  const handleNavigate = (page: Page) => {
    // Reset selected date when navigating away from a context that might use it
    if (page !== 'journal') {
        setSelectedDate(null);
    }
    setCurrentPage(page);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage('day-journal');
  };

  const handleBackToDashboard = () => {
    setSelectedDate(null);
    setCurrentPage('dashboard');
  };
  
  const handleAddTradeFromDayView = () => {
    // We already have the selected date in state
    setCurrentPage('journal');
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const tradesForSelectedDay = selectedDate 
    ? trades.filter(t => new Date(t.date).toDateString() === selectedDate.toDateString())
    : [];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage trades={trades} onDateSelect={handleDateSelect} />;
      case 'journal':
        return <JournalPage addTradeCallback={() => setCurrentPage('dashboard')} selectedDate={selectedDate} />;
      case 'analytics':
        return <AnalyticsPage trades={trades} />;
      case 'day-journal':
        if (selectedDate) {
          return <DayJournalPage 
                    date={selectedDate} 
                    tradesForDay={tradesForSelectedDay} 
                    onBack={handleBackToDashboard}
                    onAddTrade={handleAddTradeFromDayView}
                 />;
        }
        // Fallback to dashboard if no date is selected
        setCurrentPage('dashboard');
        return <DashboardPage trades={trades} onDateSelect={handleDateSelect} />;
      default:
        return <DashboardPage trades={trades} onDateSelect={handleDateSelect} />;
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen text-white font-sans">
      <div className="flex">
        <Sidebar 
            onNavigate={handleNavigate} 
            onLogout={logout} 
            currentPage={currentPage}
            isExpanded={isSidebarExpanded}
            setExpanded={setIsSidebarExpanded}
        />
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;