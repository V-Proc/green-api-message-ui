import { useAppSelector } from '@/app/store/ReduxHooks';
import { selectIsInstanceConnected, selectPollingError } from '../model/selectors';
import styles from './ConnectionStatus.module.scss';

export default function ConnectionStatus() {
  const isConnected = useAppSelector(selectIsInstanceConnected);
  const pollingError = useAppSelector(selectPollingError);

  if (!isConnected) {
    return null;
  }

  const isError = Boolean(pollingError);

  return (
    <div className={styles.status}>
      <span
        className={isError ? styles['status__dot_status_error'] : styles['status__dot_status_ok']}
      />
      <span className={styles.status__text}>
        {isError ? pollingError : 'Получение сообщений'}
      </span>
    </div>
  );
}