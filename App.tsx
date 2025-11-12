import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { JournalPage } from './components/journal/JournalPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { DayJournalPage } from './components/journal/DayJournalPage';
import { TradeDetailPage } from './components/trade/TradeDetailPage';
// Fix: Import the centralized Page type from types.ts.
import { Trade, Page } from './types';

// Fix: Removed local Page type definition to avoid conflicts.

function App() {
  const { isAuthenticated, trades, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);


  const handleNavigate = (page: Page) => {
    // Reset context-specific state
    if (page !== 'journal' && page !== 'day-journal') {
        setSelectedDate(null);
    }
    if (page !== 'trade-detail' && page !== 'edit-journal') {
        setSelectedTradeId(null);
    }
    setCurrentPage(page);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTradeId(null);
    setCurrentPage('day-journal');
  };
  
  const handleTradeSelect = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    setCurrentPage('trade-detail');
  };

  const handleEditTrade = () => {
    if (selectedTradeId) {
      setCurrentPage('edit-journal');
    }
  };

  const handleBackToDashboard = () => {
    setSelectedDate(null);
    setSelectedTradeId(null);
    setCurrentPage('dashboard');
  };

  const handleBackToDayJournal = () => {
    setSelectedTradeId(null);
    setCurrentPage('day-journal');
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
        return <JournalPage onSaveCallback={() => setCurrentPage('dashboard')} selectedDate={selectedDate} />;
      case 'analytics':
        return <AnalyticsPage trades={trades} />;
      case 'day-journal':
        if (selectedDate) {
          return <DayJournalPage 
                    date={selectedDate} 
                    tradesForDay={tradesForSelectedDay} 
                    onBack={handleBackToDashboard}
                    onAddTrade={handleAddTradeFromDayView}
                    onTradeSelect={handleTradeSelect}
                 />;
        }
        // Fallback to dashboard if no date is selected
        setCurrentPage('dashboard');
        return <DashboardPage trades={trades} onDateSelect={handleDateSelect} />;
      case 'trade-detail':
        if (selectedTradeId) {
            const selectedTrade = trades.find(t => t.id === selectedTradeId);
            if (selectedTrade) {
                return <TradeDetailPage trade={selectedTrade} onBack={handleBackToDayJournal} onEdit={handleEditTrade} />;
            }
        }
        // Fallback if trade not found
        setCurrentPage('dashboard');
        return <DashboardPage trades={trades} onDateSelect={handleDateSelect} />;
      case 'edit-journal':
        if (selectedTradeId) {
            const tradeToEdit = trades.find(t => t.id === selectedTradeId);
            if (tradeToEdit) {
                return <JournalPage 
                          tradeToEdit={tradeToEdit}
                          onSaveCallback={() => setCurrentPage('trade-detail')} 
                       />;
            }
        }
        // Fallback if trade not found
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