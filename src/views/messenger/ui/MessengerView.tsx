import { useNotificationsPolling } from '@/features/receive-messages';
import { Sidebar } from '@/widgets/sidebar';
import { ChatWindow } from '@/widgets/chat';
import styles from './MessengerView.module.scss';

export default function MessengerView() {
  useNotificationsPolling();

  return (
    <div className={styles['messenger-view']}>
      <Sidebar />
      <ChatWindow />
    </div>
  );
}