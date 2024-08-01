import AfishaPage from '../pages/afisha';
import React from 'react';
import ReserveTablePage from '../pages/reserveTablePage';
import UserPage from '../pages/userPage';
import { history, store } from './store';
import { HistoryRouter } from 'redux-first-history/rr6';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '../shared/ui/themeContext/ThemeContext';

const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <ThemeProvider initTheme={window.Telegram.WebApp.colorScheme}>
      <QueryClientProvider client={queryClient}>
        <ReduxStoreProvider store={store}>
          <HistoryRouter history={history}>
            <Routes>
              <Route path="/" element={<AfishaPage />} />
              <Route path="/my">
                <Route path="events" element={<UserPage />} />
                <Route
                  path="reservations"
                  element={<UserPage type="reservations" />}
                />
              </Route>
              <Route path="/reservation" element={<ReserveTablePage />} />
            </Routes>
          </HistoryRouter>
        </ReduxStoreProvider>
      </QueryClientProvider>
    </ThemeProvider>

  )
}

export default App
