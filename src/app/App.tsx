import { useAuth } from '../features/auth';
import { Spinner } from '../shared/ui/Spinner';
import { AppRouter } from './router/AppRouter';
import styles from './App.module.css';

export function App() {
  const { booting } = useAuth();
  if (booting) {
    return (
      <div className={styles.boot}>
        <Spinner />
      </div>
    );
  }
  return <AppRouter />;
}
