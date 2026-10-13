import { useNotificationsPolling } from '@/features/receive-messages';

import { ChatWindow } from '@/widgets/chat';
import { Sidebar } from '@/widgets/sidebar';

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
