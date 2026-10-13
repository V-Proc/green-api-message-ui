# GREEN-API · MAX Message UI

Веб-интерфейс в стиле мессенджеров Telegram / Max для отправки и получения **текстовых** сообщений мессенджера **MAX** через [GREEN-API](https://green-api.com/max).

Возможности (минимальный набор):

- подключение к инстансу GREEN-API по `idInstance` + `apiTokenInstance`
- создание чата по ID получателя, список чатов, непрочитанные
- отправка текста методом [`SendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/)
- приём входящих методом HTTP API: `ReceiveNotification` → `DeleteNotification` (long-poll)
- статусы исходящих: «отправляется» → галочка ✓ / «Не отправлено»

---

## Технологии

- React 19 + TypeScript
- Redux Toolkit + react-redux
- Vite 6, SCSS Modules (BEM)
- Vitest + Testing Library (92 теста)
- Архитектура: Feature-Sliced Design (`src/app`, `views`, `widgets`, `features`, `entities`, `shared`)

## Требования

- **Node.js 20+** (в проекте проверено на v22 LTS; Node 18 не поддерживается vitest 4 и не позволяет закрыть уязвимости `npm audit`)
- npm 11+ (npm 10.9.x падает с ошибкой `edgesOut` при установке vitest 4)

Если стоит nvm:

```bash
nvm use 22
```

## Установка и запуск

```bash
nvm use 22          # при необходимости
npm install
npm run dev         # dev-сервер: http://localhost:5173
```

Другие команды:

| Команда | Действие |
|---|---|
| `npm run dev` | dev-сервер с HMR (http://localhost:5173) |
| `npm run build` | проверка типов (tsc) + продакшен-сборка в `dist/` |
| `npm run preview` | раздача продакшен-сборки (http://localhost:4173) |
| `npm test` | прогон всех тестов (vitest run) |
| `npm run test:watch` | тесты в watch-режиме |
| `npm run lint` | ESLint (код-стайл + границы FSD по AGENTS.md) |
| `npm run lint:fix` | то же с автофиксом |

---

## Подготовка инстанса GREEN-API (обязательно перед ручным тестированием)

1. Зарегистрируйтесь в [личном кабинете](https://console.green-api.com). Для MAX доступен бесплатный тариф «Разработчик» (есть квоты на количество сообщений).
2. Создайте инстанс типа **MAX** и привяжите аккаунт MAX по QR-коду (кнопка QR в карточке инстанса; отсканируйте из приложения MAX).
3. Скопируйте **idInstance** и **apiTokenInstance** из карточки инстанса.
4. В настройках инстанса включите переключатель **«Получать уведомления о входящих сообщениях и файлах»** (`incomingWebhook`).
5. Поле **webhookUrl должно быть пустым** — приложение забирает уведомления методом `receiveNotification`. Если URL заполнен, API вернёт ошибку `Message cannot be received because custom webhook url is set` (см. «Траблшутинг» в [QA.md](QA.md)).

### Формат chatId в MAX

| Тип чата | Формат | Пример |
|---|---|---|
| Личный чат (ID пользователя MAX) | число | `10000000` |
| Номер телефона | `79991234567@c.us` | `79991234567@c.us` |
| Групповой чат | отрицательное число | `-10000000000000` |

Как узнать chatId собеседника: попросите его написать вам первым — чат и ID появятся в интерфейсе автоматически; либо воспользуйтесь методом [CheckAccount](https://green-api.com/v3/docs/api/service/CheckAccount/) в отладчике API в личном кабинете.

---

Сценарии ручного тестирования, известные ограничения и траблшутинг — в [QA.md](QA.md).
