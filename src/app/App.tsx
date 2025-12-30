import { AppProviders } from './AppProviders';
import { Router } from './router';

export function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}

export default App;
