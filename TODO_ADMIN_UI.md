# MatchPoint Admin — Club Management TODO

## Цел

Да се изгради първа вътрешна MatchPoint Admin зона за onboarding и управление на клубове. Първата итерация е UI прототип с mock данни и без заявки, които променят backend данни.

Този файл е постоянният implementation checklist. При започване или завършване на работа статусите и бележките тук трябва да се обновяват, така че следваща сесия да може да продължи от оставащите задачи.

## Договорени решения

- Използваме съществуващия дизайн, компоненти, responsive patterns, light/dark theme и BG/EN i18n.
- Admin зоната е отделна от player приложението и club manager workspace-а.
- Основен route namespace: `/admin/clubs`.
- Използваме съществуващите `Club`, `Court`, `OpeningHour` и `Price` концепции; не създаваме паралелни `AdminClub` или `AdminCourt` domain модели.
- Достъпът концептуално е чрез отделна `isAdmin` роля, а не чрез текущия общ `isStaff` флаг.
- Първата версия използва mock/in-memory данни. Промените се губят при refresh.
- Не използваме `localStorage` за admin данните.
- UI прототипът не трябва да изпраща `POST`, `PATCH`, `PUT` или `DELETE` заявки към backend-а.
- Setup flow-ът е проста страница със секции и checklist, а не сложен wizard.
- Функционалността е с приоритет пред декоративен UI polish.
- Снимките използват стандартен HTML file input и локален preview; не добавяме upload библиотека за MVP.
- `Preview as player` не е част от MVP.
- Club manager-ът се въвежда с проста форма за име, телефон и email; няма user search/select в тази версия.
- Финалното `Create club` действие показва бъдещия backend payload като JSON в `alert`, без да изпраща заявка.
- Create flow-ът събира на една страница club profile, снимка, удобства, кортове/настилки, базови цени, седмично работно време и manager контакти.

## Статуси

Използваме един status върху споделения Club модел:

- `Draft` — клубът се конфигурира и не е публичен.
- `Active` — клубът е готов за показване и резервации.
- `Inactive` — клубът е временно скрит/недостъпен за нови резервации.

Начални позволени преходи:

- `Draft → Active`
- `Active → Inactive`
- `Inactive → Active`

Редакция е позволена при всеки статус. Връщане `Active/Inactive → Draft` не е част от първия UI, освен ако backend contract-ът по-късно не го изисква.

## Минимални условия за Activate

- [ ] Име на клуба
- [ ] Адрес или локация
- [ ] Поне един активен корт
- [ ] Поне един валиден запис за работно време
- [ ] Базова цена за всеки активен корт
- [ ] Попълнени име, телефон и email на club manager

Cover image е препоръчителен, но не блокира activation в MVP.

## Фаза 0 — Подготовка и граници

- [x] Потвърди точния временен dev достъп до Admin зоната до наличието на backend `isAdmin` — отделен dev-only Admin view toggle.
- [ ] Документирай кои съществуващи staff компоненти могат да се използват директно и кои трябва да се направят по-общи.
- [x] Дефинирай admin mock data adapter/provider, отделен от реалните mutation hooks.
- [x] Гарантирай, че admin mock действията не могат да извикат реалния backend.
- [x] Добави видимо означение: `UI prototype — changes are not persisted`.

## Фаза 1 — Admin основа

- [x] Добави отделен `isAdmin` capability към frontend auth модела.
- [x] Добави `RequireAdmin` route guard, отделен от `RequireStaff`.
- [x] Добави Admin shell/layout чрез съществуващите design tokens и shared UI компоненти.
- [x] Добави `/admin/clubs` route.
- [x] Добави `/admin/clubs/new` route.
- [x] Добави `/admin/clubs/:id` route.
- [x] Добави navigation entry само за администратори.
- [x] Осигури правилно route guard поведение за anonymous, player, club manager и admin потребители.

## Фаза 2 — Mock data слой

- [x] Разшири общия `Club` contract само с липсващите полета, нужни за UI прототипа.
- [x] Добави `Draft | Active | Inactive` status.
- [x] Добави manager contact данни към setup aggregate-а, без отделна authentication система.
- [x] Добави временен `is_active` contract към `Court`, който трябва да се потвърди с backend-а.
- [x] Подготви малък набор от mock клубове във всички статуси.
- [x] Премахни зависимостта от mock user list; manager-ът се въвежда като контактни данни.
- [x] Поддържай create/update/status/court операции само в React memory state.
- [x] Осигури лесна бъдеща замяна на mock adapter-а с API adapter.

## Фаза 3 — Списък с клубове

- [x] Покажи всички mock клубове на `/admin/clubs`.
- [x] Покажи status badge: Draft, Active или Inactive.
- [x] Покажи основна информация: име, локация, manager и setup progress.
- [x] Добави просто търсене по име/локация.
- [x] Добави филтър по status.
- [x] Преработи club index-а като компактен operational list с интерактивни status обобщения, manager, courts и setup progress.
- [x] Подобри club search control-а с цялостна clickable област, нормален focus state и clear действие.
- [ ] Добави филтър за incomplete setup, ако не усложнява интерфейса.
- [x] Добави ясно primary действие `Create club`.
- [x] Добави edit/open setup действие за всеки клуб.
- [ ] Покрий loading, empty, no-results и error presentation states.
- [x] Осигури удобен mobile card изглед вместо широка таблица.

## Фаза 4 — Създаване и основна информация

- [x] Създавай новите клубове първоначално като `Draft`.
- [x] Добави полета за име, адрес/локация, описание и контакти.
- [x] Използвай вече поддържаните Club полета, където са приложими.
- [x] Добави базова required validation при създаване (email validation остава за polish).
- [x] Запазвай редакциите директно в локалния in-memory store.
- [x] Добави cancel/back поведение.
- [x] Покажи форматиран бъдещ backend payload в `alert` при `Create club`.
- [x] Включи пълната начална конфигурация в create flow-а, вместо да изисква празен клуб да се допълва секция по секция.
- [x] Включи courts, surfaces, hourly pricing, opening hours, facilities, cancellation policy и manager contact в бъдещия payload.
- [x] Раздели profile details на самостоятелна „Снимки“ секция и отделна „Удобства и условия за отказ“ секция с selectable facility cards.
- [x] Добави отделна gallery upload област с multiple selection, локални thumbnails, премахване на снимка и metadata в бъдещия payload.
- [x] Уеднакви edit/setup екрана с create flow-а: същите section cards, images/gallery, facilities/cancellation и десен progress summary.
- [ ] Предупреждавай при напускане със запазени само във form state промени, ако е необходимо.

## Фаза 5 — Снимки и спортове

- [x] Добави cover image file input с локален preview.
- [x] Добави remove/replace действие за preview-то.
- [x] Покажи, че изображението не се качва и няма да се запази след refresh.
- [x] Не добавяй външна upload библиотека.
- [ ] Извеждай supported sports от кортовете, освен ако бъдещият backend contract не изисква отделно Club поле.

## Фаза 6 — Кортове

- [x] Преизползвай съществуващия Court модел; UI е отделен, за да не извиква API mutation hooks.
- [x] Добави корт.
- [x] Редактирай основните свойства на корт.
- [x] Активирай/деактивирай корт.
- [x] Показвай ясно Active/Inactive състояние.
- [x] Запази delete като вторично действие с confirmation dialog.
- [ ] Валидирай минимално име, спорт и поддържаните court properties.
- [x] Не нарушавай съществуващия club manager Courts UI.

## Фаза 7 — Работно време

- [x] Преизползвай съществуващите weekly schedule conventions в API-compatible локален редактор.
- [x] Поддържай add/edit/remove на дневни интервали.
- [ ] Валидирай само задължителните полета и `closing > opening`.
- [x] Показвай затворените дни ясно.
- [x] Не добавяй holidays, exceptions или advanced scheduling в MVP.

## Фаза 8 — Цени

- [x] Преизползвай съществуващия per-court pricing модел в локален редактор.
- [x] Поддържай прости weekday/time price bands.
- [ ] Валидирай положителна цена и `time_end > time_start`.
- [x] Показвай BGN и ясно означавай, че стойността е за 30 минути.
- [x] Не добавяй dynamic pricing, promo codes или сложни правила.
- [x] Отбелязвай активен корт без цена като incomplete setup.

## Фаза 9 — Club manager

- [x] Добави проста форма за име, телефон и email.
- [x] Покажи текущите manager контакти в setup екрана.
- [x] Позволи директна локална редакция на manager контактите.
- [x] Не добавяй отделна authentication система.
- [x] Не добавяй invitation flow или advanced staff permissions в MVP.

## Фаза 10 — Review и lifecycle действия

- [x] Добави setup checklist с completed/incomplete секции.
- [x] Добави общ progress indicator.
- [x] Покажи кратко review summary преди activation.
- [x] Блокирай локалното Activate действие при липса на минималните условия.
- [x] Покажи разбираеми причини защо activation не е достъпна.
- [x] Добави confirmation dialog за Activate.
- [x] Добави confirmation dialog за Deactivate.
- [x] Отразявай status промяната в mock club list-а.
- [x] Не добавяй player preview в MVP.

## Фаза 11 — Интеграция със съществуващия продукт

- [x] Добави EN translation keys.
- [x] Добави съответните BG преводи без липсващи ключове.
- [x] Използвай съществуващите theme tokens за light и dark theme.
- [x] Добави desktop и mobile layouts.
- [x] Използвай съществуващите Toast и общи UI patterns; confirmation-ите са native в прототипа.
- [ ] Добави достъпни labels, error messages, keyboard actions и focus behavior.
- [x] Запази player routes и `/club/*` workspace-а без промяна на техните data flows.

## Фаза 12 — Проверка на UI прототипа

- [x] Изпълни `npm run typecheck`.
- [x] Изпълни `npm run build`.
- [x] Провери по архитектура, че admin действията не използват API write функции.
- [ ] Провери create → configure → activate flow.
- [ ] Провери active → inactive → active flow.
- [ ] Провери add/edit/deactivate/delete court flow.
- [ ] Провери validation и incomplete setup states.
- [ ] Провери refresh поведението: mock промените се нулират очаквано.
- [ ] Провери BG/EN, light/dark и основните responsive breakpoints.
- [ ] Обнови този TODO с изпълнените задачи и оставащите backend зависимости.

## Бъдеща backend интеграция — извън UI прототипа

- [ ] Потвърди backend permission contract за platform admin спрямо club manager.
- [ ] Потвърди `isAdmin`/permissions полето в `/auth/user/`.
- [ ] Потвърди admin list endpoint, който вижда Draft и Inactive клубове.
- [ ] Потвърди create/update/status endpoints за Club.
- [ ] Потвърди server-side activation validation.
- [ ] Потвърди active/inactive contract за Court.
- [ ] Потвърди бъдещия backend contract за manager contact данните и/или user assignment.
- [ ] Потвърди image upload/storage contract.
- [ ] Потвърди как статусите влияят на player-facing list, availability и booking.
- [ ] Замени mock adapter-а с реални TanStack Query hooks и точни cache invalidations.
- [ ] Добави backend authorization проверки; frontend guard-ът не се счита за security boundary.

## Извън обхвата

- Self-service club registration
- Billing, subscriptions и invoicing
- CRM и marketing инструменти
- Advanced staff roles и permissions
- Analytics dashboard
- Promo codes и dynamic pricing
- Tournament и membership management
- Advanced schedules, holidays и exceptions
- Реално image upload-ване преди backend contract
- Player-facing preview

## Definition of Done за първата UI итерация

- Admin може да отвори отделната `/admin/clubs` зона чрез временния dev достъп.
- Може да разгледа, търси и филтрира mock клубове.
- Може локално да създаде Draft клуб и да редактира информацията му.
- Може локално да конфигурира кортове, работно време, цени и manager.
- Може локално да активира и деактивира валидно конфигуриран клуб.
- UI не изпраща backend write заявки и ясно показва, че промените не се запазват.
- Използвани са съществуващите domain модели и UI patterns, без паралелна admin booking архитектура.
- Player и club manager функционалността продължават да работят.
- Typecheck и production build завършват успешно.
- TODO файлът отразява реално завършената и оставащата работа.

## Бележки за продължаване

- При всяка завършена задача смени `[ ]` на `[x]`.
- Добавяй новооткрити задачи в правилната фаза, вместо да ги пазиш само в session notes.
- Ако решение се промени след уточняване на backend contract, обнови първо секцията „Договорени решения“.
- Не маркирай UI задача като завършена само защото съществува стар staff компонент; провери, че той работи коректно и в Admin контекста.
