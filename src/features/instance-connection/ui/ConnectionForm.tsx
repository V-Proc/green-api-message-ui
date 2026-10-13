import { type FormEvent, useEffect, useState } from 'react';

import { DEFAULT_API_URL } from '@/shared/config/GreenApiConfig';
import { Button, TextField } from '@/shared/ui';

import { connect } from '@/features/instance-connection';
import { selectCredentials } from '@/features/instance-connection/model/selectors';

import { useAppDispatch, useAppSelector } from '@/app/store/ReduxHooks';

import styles from './ConnectionForm.module.scss';

const STORAGE_KEY = 'green-api-credentials';

export default function ConnectionForm() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector(selectCredentials);
  const [apiUrl, setApiUrl] = useState(credentials.apiUrl || DEFAULT_API_URL);
  const [idInstance, setIdInstance] = useState(credentials.idInstance);
  const [apiTokenInstance, setApiTokenInstance] = useState(credentials.apiTokenInstance);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!formError) {
      return;
    }

    const timer = setTimeout(() => setFormError(null), 5000);

    return () => clearTimeout(timer);
  }, [formError]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!apiUrl.trim() || !idInstance.trim() || !apiTokenInstance.trim()) {
      setFormError('Заполните все поля');

      return;
    }

    const trimmedUrl = apiUrl.trim().replace(/\/+$/, '');

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ apiUrl: trimmedUrl, idInstance, apiTokenInstance }),
    );
    dispatch(
      connect({
        apiUrl: trimmedUrl,
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      }),
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.form__title}>GREEN-API · MAX</h1>
      <p className={styles.form__hint}>
        Скопируйте apiUrl, idInstance и apiTokenInstance из карточки инстанса в
        console.green-api.com
      </p>
      <TextField
        className={styles.form__field}
        placeholder="apiUrl (https://3100.api.green-api.com)"
        autoComplete="off"
        value={apiUrl}
        onChange={(event) => setApiUrl(event.target.value)}
      />
      <TextField
        className={styles.form__field}
        placeholder="idInstance"
        inputMode="numeric"
        autoComplete="off"
        value={idInstance}
        onChange={(event) => setIdInstance(event.target.value)}
      />
      <TextField
        className={styles.form__field}
        placeholder="apiTokenInstance"
        type="password"
        autoComplete="off"
        value={apiTokenInstance}
        onChange={(event) => setApiTokenInstance(event.target.value)}
      />
      {formError ? <p className={styles.form__error}>{formError}</p> : null}
      <Button className={styles.form__submit} type="submit">
        Подключиться
      </Button>
    </form>
  );
}
