import { useAppSelector } from '@/app/store/ReduxHooks';
import { selectIsConnected } from '@/features/instance-connection';
import { ConnectionForm } from '@/features/instance-connection';
import { MessengerView } from '@/views/messenger';
import styles from './App.module.scss';

export default function App() {
  const isConnected = useAppSelector(selectIsConnected);

  return (
    <div className={styles.app}>
      {isConnected ? (
        <MessengerView />
      ) : (
        <div className={styles.app__auth}>
          <ConnectionForm />
        </div>
      )}
    </div>
  );
}