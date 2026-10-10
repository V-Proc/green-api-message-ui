import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import App from '@/app/App';
import '@/app/styles/global.scss';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Не найден корневой элемент #root');
}

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);