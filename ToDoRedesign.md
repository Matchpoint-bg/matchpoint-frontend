# MatchPoint — UI/UX Redesign Master Plan

## 1. Цел на redesign-а

MatchPoint трябва да бъде преосмислен като нов premium sports booking продукт, а не като визуален facelift на съществуващото приложение.

Основната цел е:

> Потребителят да може да намери и резервира тенис корт възможно най-бързо, с минимален брой стъпки, ясна цена и без излишно мислене.

Новият интерфейс трябва да бъде:

- mobile-first и напълно responsive;
- модерен за 2026 г., но достатъчно устойчив като визуален език за 2030 г.;
- premium, чист и разпознаваем;
- sporty, без да прилича на generic fitness сайт;
- trustworthy при резервация и плащане;
- достъпен, бърз и предвидим;
- изграден върху съществуващата business logic и feature-oriented архитектура.

---

## 2. Непроменими продуктови принципи

Всички design и implementation решения трябва да се проверяват спрямо тези принципи:

1. **Availability first** — свободните часове са основната стойност на продукта.
2. **Search before browsing** — началният екран започва с намерението на играча: къде, какво и кога.
3. **No forced authentication before intent** — разглеждането и изборът на слот са публични; login се изисква при потвърждение.
4. **Preserve booking intent** — login, refresh и back navigation не трябва да губят избрания клуб, корт, дата и час.
5. **One obvious primary action** — всеки екран има една недвусмислена основна следваща стъпка.
6. **Progressive disclosure** — показваме първо необходимото за решение, после подробностите.
7. **Accurate language** — „Виж свободни часове“ преди избор; „Резервирай“ или „Потвърди“ само при реален commitment.
8. **Trust through clarity** — точна цена, продължителност, политика за отказ и payment status.
9. **Player UI and Club UI are separate products** — общи основи, но различна навигация и задачи.
10. **Accessibility is part of quality** — не е финален polish етап.

---

## 3. Product scope

### MVP — Players

```text
Search
→ Club results
→ Club details + availability
→ Choose court/time
→ Booking review
→ Login/Register, ако е необходимо
→ Confirm reservation
→ Booking confirmation
→ My bookings
```

### MVP — Clubs acquisition

```text
For Clubs landing
→ Lead form
→ Lead sent
```

### Club operator workspace

Съществуващите staff функции се преместват в отделен workspace:

```text
Overview
→ Schedule
→ Bookings
→ Courts and prices
→ Blocked times
→ Opening hours
→ Team and club settings
```

### Извън първия redesign release

- rankings;
- friends и social feed;
- coaches;
- tournaments;
- matchmaking;
- сложен self-service onboarding за клубове;
- loyalty/gamification;
- online payment, ако business моделът още не го изисква.

---

## 4. Целева information architecture

### Public и Player routes

| Route | Предназначение | Access |
|---|---|---|
| `/players` | Search landing и results state | Public |
| `/players?city=sofia&sport=tennis&date=YYYY-MM-DD&time=HH:mm` | Споделяемо търсене | Public |
| `/clubs/:id` | Club profile и основен availability екран | Public |
| `/book/:courtId/review` | Преглед на избрания slot | Public; confirm изисква auth |
| `/book/:courtId/checkout` | Hold, user details и confirm/payment | Authenticated |
| `/booking/confirmation/:id` | Success и booking details | Authenticated |
| `/bookings` | Upcoming/Past резервации | Authenticated |
| `/bookings/:id` | Детайли и действия за резервация | Authenticated |
| `/login` | Login/Register | Signed out |
| `/forgot-password` | Password reset request | Signed out |
| `/reset-password/:uid/:token` | Password reset confirmation | Signed out |
| `/account` | Profile и account actions | Authenticated |
| `/account/settings` | Language, theme, notifications, PWA | Authenticated |
| `/for-clubs` | B2B landing page | Public |
| `/for-clubs/contact` | Lead form, ако не е inline | Public |
| `/for-clubs/success` | Lead confirmation | Public |

### Club workspace routes

| Route | Предназначение |
|---|---|
| `/club` | Dashboard overview |
| `/club/schedule` | Дневен/седмичен график |
| `/club/bookings` | Управление на резервации |
| `/club/courts` | Courts, prices и blocked time |
| `/club/team` | Employees |
| `/club/settings` | Club data и opening hours |

### Routing decisions

- В първата версия запазваме numeric club IDs.
- Slug routes се добавят само след `slug` поле и backend contract.
- Старите `/reservations`, `/profile`, `/settings` и `/courts/:id` получават redirect или compatibility strategy.
- Да се вземе отделно решение дали HashRouter остава за първия release или се мигрира към history routing.
- Search и booking review state трябва да могат да бъдат възстановени след refresh.

---

## 5. Design direction — Precision Sports Utility

### Визуална идея

MatchPoint трябва да комбинира:

- прецизността на booking продукт;
- енергията на тениса;
- спокойствието и сигурността на premium checkout;
- визуална идентичност, вдъхновена от геометрията на корта, а не от fitness clichés.

Дизайнът не трябва да зависи от краткотрайни тенденции като прекомерно glassmorphism, neon gradients, 3D decoration или bubble UI.

### Color system

- **Canvas:** warm off-white/stone, вместо стерилно бяло.
- **Primary ink:** deep graphite или dark forest.
- **Brand accent:** tennis-ball lime, използван пестеливо за CTA, selection и active state.
- **Secondary accent:** muted clay за surface/category context, не като втори primary цвят.
- **Success, warning, danger:** семантични цветове, независими от brand palette.
- Всички text/background комбинации трябва да покриват WCAG AA.
- Състоянията не трябва да се различават само чрез цвят.

### Typography

- Да се оцени запазване на текущите Archivo + Inter + Space Mono.
- Display type се използва само за ясна йерархия и brand moments.
- Body текстът трябва да остане спокоен и много четим.
- Mono се използва ограничено за време, цена и booking reference.
- Да се дефинира type scale за mobile и desktop, без прекалено големи marketing headlines.

### Layout и spacing

- 4/8 px spacing system.
- Mobile content gutters: минимум 16 px.
- Desktop max-width да се избере според страницата, а не глобално за всичко.
- Search/results могат да са по-широки от account forms.
- Minimum touch target: 44 × 44 px; предпочитано 48 px за основни действия.
- Sticky елементи не трябва да покриват content или mobile navigation.

### Shape и elevation

- Средно заобляне, без всяка повърхност да изглежда като pill.
- Borders и whitespace преди тежки shadows.
- По-силна elevation само за floating booking summary, modal и sheet.
- Court-line motif може да се използва като фин brand detail.

### Photography и imagery

- Реални, качествени снимки на кортове и клубове.
- Consistent aspect ratios и image treatment.
- Добри fallback изображения/placeholder-и.
- Без generic gym stock photography.
- Галерията да помага при решение, без да измества availability надолу.

### Motion

- 150–250 ms за основни UI transitions.
- Motion се използва за selection, feedback и spatial continuity.
- Да няма decorative animation, която забавя booking flow.
- Задължително `prefers-reduced-motion` поведение.

### Design quality bar

Екран не е готов, ако:

- primary action не се разбира за 2–3 секунди;
- най-важната информация е под декоративен content;
- mobile layout е просто свит desktop;
- loading, empty, error и disabled states не са проектирани;
- touch targets са малки;
- keyboard focus не се вижда;
- цената или следващата стъпка са двусмислени;
- Bulgarian copy се чупи заради по-дълги текстове;
- дизайнът зависи от hover;
- component variant е създаден ad hoc без място в system-а.

---

## 6. Design system foundations

### TODO — foundations

- [x] Направи UI inventory на всички текущи компоненти и CSS primitives.
- [x] Определи новите semantic design tokens: canvas, surface, text, border, brand, state.
- [x] Определи type scale, font weights и line heights.
- [x] Определи spacing, radius, border и elevation scales.
- [ ] Определи responsive breakpoints според content behavior.
- [x] Определи z-index и overlay layers.
- [x] Определи motion durations и easing tokens.
- [x] Определи focus, hover, active, pressed, disabled и loading states.
- [x] Определи light/dark strategy; не допускай dark theme да забави основния redesign.
- [x] Създай малка internal design-system showcase страница или development route. (`/showcase`, само в dev build)

### TODO — shared primitives

- [x] `Button`: primary, secondary, outline, ghost, dark, danger, google, loading, block, sm. Плюс `LinkButton`.
- [x] `IconButton` с задължителен accessible label.
- [x] `Input`, `SearchInput`, `Select`, `DateField`, `TimeField`, `Textarea`.
- [x] `Field`, hint, error message и required state.
- [x] `Chip` и `FilterChip` (toggle с `aria-pressed`).
- [x] `StatusBadge`, `SurfaceBadge`. Плюс базовия `Badge` и `BookingStatus`.
- [x] `Card`, `Section`, `Divider`.
- [x] `Toolbar`.
- [x] `Dialog` с focus trap, Escape close и focus return.
- [x] Mobile `BottomSheet` и desktop side panel behavior (`Sheet`, `placement="bottom" | "side"`).
- [x] `Toast` с accessible live region.
- [x] `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`.
- [x] `Tabs` и segmented controls с keyboard support (Left/Right/Home/End, roving tabindex).
- [x] `Price`, `DateTime`, `BookingStatus` display components.

> **Миграция.** Новите form primitives се използват от `PlayerSearchForm`, `AuthForm`,
> `ClubFilters` и `ReservationCard`. Останалите екрани още пишат глобалния `.field` клас и
> се местят в отделен pass: staff modals (`CourtFormModal`, `EditClubModal`,
> `OpeningHoursModal`, `PricesModal`, `UnavailabilityModal`, `OpeningHoursDayRow`,
> `StaffSettings`), profile modals (`EditProfileModal`, `ChangePasswordModal`),
> `ForgotPasswordPage`, `ResetPasswordPage`, `PlayerSettings`, `DeveloperSettings`.
> Legacy `.field` правилата живеят в `src/styles/forms.css` и се трият след тази миграция.

### Acceptance criteria

- [x] Няма hardcoded feature colors извън tokens, освен документировано изключение.
- [x] Всички interactive states са видими и consistent.
- [ ] Components работят при 320 px viewport и 200% zoom.
- [ ] Bulgarian и English layouts са проверени.
- [x] Core components имат keyboard и screen-reader semantics.

**Бележки по критериите**

- *Feature colors.* Chip, slot, legend и skeleton цветовете вече са semantic token
  двойки в `foundation.css` (light + dark на едно място). `theme-overrides.css` вече
  съдържа само structural dark правила, не цветови дубликати. Единственото
  документирано изключение е `.btn--google` (`#fff` / `#1f2937` / `#f8fafc`) — Google
  изисква точно тези brand стойности.
- *Interactive states.* Глобален `button/a/input/select/textarea:focus-visible` ring в
  `foundation.css`; `:active` и `:disabled` за `.btn`, `.chip--btn`, `.input`/`.select`/
  `.textarea` и `.tabs__tab`. `Tabs` ползва inset focus ring, за да не се отрязва в
  segmented контейнера.
- *Keyboard/SR.* Проверено: няма icon-only бутон без accessible name; `Tabs` е истински
  tablist с roving tabindex; `Modal` и `Sheet` споделят `useFocusTrap` (focus trap,
  Escape, focus restore, refcounted scroll lock); `Chip` изнася `aria-pressed`; `Field`
  свързва грешките през `aria-describedby`/`aria-invalid`; `Toast` е live region.
  Пълнотата на BG речника е гарантирана от типа `Record<TranslationKey, string>`.
- *Остават за browser QA (не могат да се потвърдят статично):* 320 px и 200% zoom
  reflow, както и BG/EN layout проверката. Статичният преглед не откри fixed-width
  преливане, но `.btn` е `white-space: nowrap` — по-дългите български етикети в тесни
  `btn--sm` контейнери са основният риск за проверка.

---

## 7. App shell и navigation

### Player shell

- [x] Нова desktop header навигация: logo/home, „За играчи“, „За клубове“, account/login.
- [x] Logged-in navigation: „Резервации“ и profile menu.
- [x] Mobile bottom navigation да показва само primary destinations.
- [x] Profile, language, theme и logout да се преместят в account menu/settings.
- [x] Active route state да бъде правилно отразен.
- [x] Header да остава компактен и да не конкурира search/booking CTA.

> **Бележки.** Account menu-то стои зад нов `Menu` primitive (`shared/ui/Menu`) — ARIA menu
> button с roving tabindex, Escape/outside-click/Tab-away затваряне и focus return; съзнателно
> *не* ползва `useFocusTrap`, защото меню трябва да се затваря при напускане на фокуса, а не
> да го заключва. `.topbar__user` е скрит под 900 px, затова на mobile език, тема и изход
> остават в Settings и на `/profile` — sign out съзнателно е запазен и там.
>
> „За клубове“ води към нов публичен `/for-clubs` stub (`src/pages/for-clubs/`): hero, benefits
> и contact блок с `mailto:`. Phase 6 (§13) заменя contact блока с истинска lead форма. Няма го
> в mobile tab bar-а — B2B destination, а не player primary destination.

### Club workspace shell

- [x] Отделна desktop sidebar/topbar IA за operator tasks.
- [x] Mobile navigation за Schedule, Bookings, Courts и More.
- [ ] Club switcher само ако user има достъп до повече от един клуб.
- [x] Role/staff контекстът да е ясен, без staff controls в player страниците.

### Acceptance criteria

- [x] Player никога не вижда административни actions в marketplace flow.
- [x] Staff може да премине към club workspace без да губи player account access.
- [x] Основните destinations са достъпни с максимум един navigation action.

> **Бележки.** Workspace-ът живее в собствен `ClubShell` (`src/app/layout/ClubShell/`),
> отделен от `AppShell` — двете IA са различни и смесването им е причината staff
> бутоните да стоят по marketplace страниците. За разлика от player shell-а, активният
> destination се извежда от URL-а, а не от per-page `active` prop. Desktop-ът е
> постоянен sidebar (≥900 px); под 900 px пада до същия `.tabbar` с Schedule,
> Bookings, Courts и More, а „More“ (`/club/settings`) води до Overview, Team и
> изхода към player app-а. Достъпът е зад нов `RequireStaff` guard; routes-ите са
> `/club`, `/club/schedule`, `/club/bookings`, `/club/courts`, `/club/team`,
> `/club/settings` (§4).
>
> `StaffBar`, `CourtStaffBar` и `StaffSettings` са премахнати. Всичките им действия
> вече са в workspace-а — `CourtsManager` покрива edit/prices/block/delete/new court,
> `EmployeesModal` е `/club/team`, `EditClubModal` и `OpeningHoursEditor` са в
> `/club/settings`. Player `/settings` вече е само player tab-ът плюс една връзка към
> workspace-а; account menu-то печели „Клубен workspace“ (само при `isStaff`) и обратен
> вход към player app-а, така че преминаването е в двете посоки с едно действие.
>
> *Club switcher-ът остава отворен.* Няма endpoint „клубове, които управлявам“ —
> `User` носи само `is_staff`/`is_superuser`, а `useClubsQuery` връща всички клубове,
> така че switcher в header-а би показал чужди клубове. Логиката е капсулирана в
> `useStaffClub()` (`src/features/staff/model/`): избраният клуб се пази в
> `store.staffClub`, при един клуб се избира автоматично, при няколко `ClubGate`
> иска избор. Когато backend-ът добави membership, се сменя само този hook.
>
> Schedule и Bookings са съзнателни placeholders — операционният график и управлението
> на резервации са Phase 7 (§14); тук се добавя само IA-та, за да е пълна навигацията.

---

## 8. Phase 1 — Search и club results

### Search model

- [x] Създай `SearchCriteria` model: city, sport, date, optional time.
- [x] Синхронизирай search state с URL query parameters.
- [x] Не позволявай минали дати.
- [x] ~~Добави quick dates: Днес, Утре, Уикенда.~~ Премахнато от search form по продуктово решение.
- [x] Дефинирай поведение при липсваща дата.
- [x] Дефинирай validation и invalid URL recovery.

### Search landing

- [x] Нов compact hero с кратко value proposition.
- [x] Search form да бъде основният visual focus над fold-а.
- [x] City и sport да са scalable controls, дори първоначално да имат една стойност.
- [x] Primary CTA: „Покажи клубове“.
- [x] Secondary content да не измества search form-а.
- [ ] Logged-in user може да вижда следващата си резервация, без тя да доминира началото.

### Results

- [x] Резултатите се показват само след валидно search действие.
- [x] Добави results summary: град, дата, optional time и брой резултати.
- [ ] Добави mobile filter/sort sheet.
- [x] Club result card: image, име, локация, surfaces, indoor/outdoor, price from.
- [ ] Когато API позволява: покажи 2–4 най-близки свободни часа.
- [x] CTA: „Виж свободни часове“.
- [ ] Проектирай loading, no clubs, no availability, error и retry states.
- [ ] Запази scroll/search state при връщане от club details.

### Backend/data dependency

- [x] Проучи endpoint за aggregated availability по city/sport/date/time. Текущият backend няма такъв endpoint; остава отделна API зависимост.
- [x] Не допускай N clubs × N courts заявки от frontend-а като production решение.
- [ ] Добави `starting_price` или еквивалентен aggregate.
- [ ] Добави club thumbnail/image field.

### Acceptance criteria

- [x] Search може да се сподели чрез URL.
- [ ] Browser back възстановява резултатите и scroll позицията.
- [x] Потребителят достига club availability с максимум две primary действия.
- [x] Search работи еднакво добре с touch, mouse и keyboard.

---

## 9. Phase 2 — Club details и availability

### Club profile

- [x] Compact club identity: име, квартал/адрес, trust facts.
- [ ] Gallery с оптимизирани изображения и fallback.
- [x] Facilities, surfaces, indoor/outdoor и осветление.
- [x] Map/directions action.
- [x] Phone и website actions.
- [x] Opening hours и description под основния booking module.
- [x] Дефинирай sticky anchor/CTA поведение при дълга страница.

### Availability module

- [x] Премести основния booking избор на club page.
- [x] Запази избраната search дата при отваряне на клуба.
- [x] Date strip с днес + следващи дни и достъпен full date picker.
- [x] Surface и indoor/outdoor filters само когато имат смисъл.
- [x] Групирай available times по court row/card.
- [x] Покажи time и price върху selectable slot.
- [x] Различавай `available`, `selected`, `booked`, `held`, `closed` и `past`.
- [x] Disabled slot да има разбираема причина, когато е полезно.
- [x] Позволи избор на валидна продължителност чрез последователни slots.
- [x] Предотврати non-contiguous selection или го коригирай автоматично.
- [x] Sticky booking summary след избор.
- [ ] Mobile summary като bottom sheet/bar; desktop summary като sticky side card.
- [x] Отделната court detail страница да отпадне от primary player flow.

### Backend/data dependency

- [ ] Availability response да има explicit status, не само `available: boolean`.
- [ ] Потвърди timezone contract между frontend и backend.
- [ ] Добави minimum/allowed booking duration, ако варира по клуб.
- [ ] Добави cancellation policy към club или booking quote.

### Acceptance criteria

- [x] На mobile дата, court, свободен час и цена се разбират без horizontal spreadsheet.
- [x] Past slots не могат да се избират.
- [x] Смяната на дата изчиства невалидна selection.
- [x] Изборът на slot дава незабавна и достъпна обратна връзка.
- [x] Primary CTA остава видим, без да покрива последния content.

> **Имплементация с mock data.** `availabilityApi.club()` е единствената граница към
> данните: в demo mode агрегира fixture-ите, а при backend връзка очаква една заявка към
> `/api/clubs/:id/availability/?date=...`. UI не прави N заявки по кортове. Contract-ът
> включва timezone, slot duration и explicit status. Реалните backend точки в §15 остават
> немаркирани, докато serializer-ът и timezone договорът не бъдат потвърдени.

---

## 10. Phase 3 — Booking intent, review и authentication

### Booking intent

- [x] Създай canonical `BookingIntent` model.
- [x] Съхранявай clubId, courtId, date, start, end/duration и quoted price.
- [x] Направи intent възстановим след login, refresh и accidental navigation.
- [x] Използвай URL + `sessionStorage` или друг ясно документиран strategy.
- [x] Валидирай intent отново преди confirm.
- [x] Дефинирай поведение при вече зает или променен slot.

### Booking review

- [x] Покажи club, address, court, surface, date, time, duration и price.
- [x] Покажи cancellation policy.
- [x] Покажи payment method: „Плащане на място“ или online payment.
- [x] Позволи edit на дата/час без загуба на контекст.
- [x] Използвай CTA „Продължи“, преди auth/checkout.

### Authentication

- [x] Запази login/register tabs.
- [x] Обясни защо се изисква account в booking контекст.
- [x] След success върни към същия booking intent, не само към pathname.
- [x] Запази Google auth behavior.
- [ ] Проектирай error, expired session и duplicate-email states.
- [ ] Не показвай auth като generic standalone marketing screen при booking detour.

### Acceptance criteria

- [x] Signed-out user може да избере slot, да се логне и да продължи без повторен избор.
- [x] Refresh на review page не създава резервация и не губи intent.
- [x] Back не води до неочакван duplicate submit.
- [x] Цената и правилата са видими преди commitment.

---

## 11. Phase 4 — Hold, confirm/payment и success

### Business decision gate

- [ ] Потвърди дали MVP е reservation-only или включва online payment.
- [x] Ако е reservation-only, използвай точен текст „Плащане на място“.
- [x] Не създавай визуален fake checkout без реален payment contract.

### Temporary hold

- [ ] Backend state: `AVAILABLE → HELD → BOOKED`.
- [ ] Hold expiry връща slot-а към `AVAILABLE`.
- [ ] Покажи hold timer само ако hold реално съществува.
- [ ] Handle expired hold, conflict и retry.
- [ ] Не допускай double booking при паралелен checkout.

### Confirmation action

- [x] Disable double submit.
- [x] Покажи clear pending state.
- [ ] Обработи network timeout, conflict и server validation. (Conflict/server validation са покрити; липсва explicit timeout policy.)
- [x] Не показвай success преди backend confirmation.

### Online payment — само ако е в scope

- [ ] Избери payment provider и backend contract.
- [ ] Не съхранявай card data във frontend-а.
- [ ] Проектирайте processing, success, failed, cancelled и retry states.
- [ ] Свържи booking status и payment status без неясни intermediate състояния.

### Booking confirmation page

- [x] Ясен success header.
- [x] Booking number и status.
- [x] Club, address, court, date, time, duration и price.
- [x] Payment status/method.
- [x] „Добави в календара“.
- [x] „Маршрут“.
- [x] „Моите резервации“.
- [ ] Cancellation policy и support contact.

### Acceptance criteria

- [x] Повторен tap/click не създава duplicate booking.
- [x] Confirmation URL може да бъде refresh-нат безопасно.
- [x] Booking result не разчита само на toast.
- [x] При conflict user получава път обратно към актуална availability.

---

## 12. Phase 5 — My bookings и account

### My bookings

- [ ] Tabs/segments: Upcoming и Past.
- [ ] Booking card: club, court, address, date, time, status и price.
- [ ] Upcoming card actions: View, Directions, Add to calendar, Cancel/Reschedule.
- [ ] Past card actions: View; future phase — Repeat booking.
- [ ] Отделен booking details route.
- [ ] Cancel flow да показва policy и consequence преди confirm.
- [ ] Reschedule да използва същия availability и review flow.
- [ ] Status model: confirmed, cancelled, completed, no-show и payment-related statuses при нужда.

### Account

- [x] Обедини profile actions в ясен Account overview.
- [x] Edit profile и change password.
- [x] Language, theme, notifications и install app в Settings.
- [x] Logout да бъде отделен destructive action с предвидимо поведение.
- [x] Developer/demo controls да не се появяват в production UX.

### Acceptance criteria

- [ ] Новата резервация се намира лесно без highlight hack като единствен feedback.
- [ ] Cancelled booking не изчезва неочаквано, ако product policy изисква history.
- [ ] Reschedule запазва старата резервация до успешното потвърждение на новия slot.

---

## 13. Phase 6 — For Clubs landing и lead flow

### Landing page

- [ ] Hero: ясно предложение за собственици на тенис клубове.
- [ ] Benefits: повече резервации, online schedule, по-малко обаждания, по-лесно управление.
- [ ] Кратко „Как работи“.
- [ ] Product screenshots/mockups, не generic illustrations.
- [ ] Trust section и FAQ.
- [ ] Primary CTA: „Добави клуба си“.
- [ ] Landing page да използва MatchPoint brand, но да не прилича на player search page.

### Lead form

- [ ] Club name.
- [ ] City.
- [ ] Contact person.
- [ ] Email.
- [ ] Phone.
- [ ] Number of courts.
- [ ] Website/social — optional.
- [ ] Message — optional.
- [ ] Consent/privacy copy, ако е необходимо.
- [ ] Inline validation и server errors.
- [ ] Prevent duplicate submissions.

### Success

- [ ] Ясно „Получихме запитването“.
- [ ] Очакван следващ контакт/срок, ако business процесът го позволява.
- [ ] Action към player product или homepage.

### Backend dependency

- [ ] Създай lead submission endpoint или одобрен external CRM/email flow.
- [ ] Добави spam protection и rate limiting.

---

## 14. Phase 7 — Club workspace

### Separation

- [x] Премахни `StaffBar` и `CourtStaffBar` от player-facing pages.
- [x] Премести staff tools в `club-management` feature/workspace.
- [x] Използвай съществуващите queries, mutations и modals като начална business logic база.

> **Бележка.** Свършено заедно с §7 (club workspace shell) — виж бележките там.
> Преместването е на ниво pages: tools-ите вече се използват само от `/club/*`.
> Самата директория още се казва `src/features/staff/` — преименуването на
> `club-management` остава за момента, в който Schedule и Bookings се добавят тук.

### Dashboard

- [ ] Днешни резервации.
- [ ] Следваща резервация.
- [ ] Occupancy summary, само ако данните са надеждни.
- [ ] Quick actions: add booking/block time/manage court.

### Schedule

- [ ] Mobile-friendly agenda/day view.
- [ ] Desktop day/week view.
- [ ] Court filters и status legend.
- [ ] Booking detail panel.
- [ ] Blocked periods.
- [ ] Не копирай customer availability UI за operational schedule.

### Management

- [x] Club details editor.
- [x] Opening hours editor с end-after-start validation.
- [x] Court create/edit/delete.
- [x] Price editor без `NaN` submissions.
- [ ] Block time form с timezone/date validation. (Date/range validation е готова; timezone contract-ът остава backend зависимост.)
- [x] Employees/team view.
- [x] Ясни destructive confirmations.

### Acceptance criteria

- [x] Staff задачите не зависят от посещаване на публична club page.
- [ ] Schedule е използваем на телефон от рецепция/корт.
- [ ] Permissions продължават да се enforce-ват от backend-а.

---

## 15. Data model и API backlog

### Clubs

- [ ] `slug`.
- [ ] thumbnail и gallery images.
- [ ] latitude/longitude или map location.
- [ ] facilities.
- [ ] cancellation policy.
- [ ] payment methods.
- [ ] starting price aggregate.
- [ ] optional neighbourhood/area.

### Courts и availability

- [ ] Explicit availability status.
- [ ] Slot duration rules.
- [ ] Accurate price quote.
- [ ] Hold ID и expiry.
- [ ] Aggregated search endpoint.
- [ ] Timezone contract.

### Reservations

- [ ] Booking number/reference.
- [ ] Club snapshot или richer nested serializer.
- [ ] Status.
- [ ] Price/currency.
- [ ] Payment method/status.
- [ ] Cancellation deadline/policy snapshot.
- [ ] Created/updated timestamps.
- [ ] Better create response с new reservation ID.

### Leads

- [ ] Club lead model/endpoint.
- [ ] Submission status и timestamp.
- [ ] Spam/rate protection.

---

## 16. Accessibility requirements

- [x] Глобален `:focus-visible` style.
- [x] Skip link към main content.
- [ ] Semantic landmarks и heading hierarchy.
- [x] Dialog focus trap, Escape close и focus restoration.
- [ ] Keyboard navigation за tabs, date strip, slots и menus.
- [ ] Slot states с text/ARIA, не само color.
- [ ] Accessible names за всички icon-only actions.
- [x] Form errors да бъдат свързани с полетата (`Field` управлява `aria-describedby`/`aria-invalid`).
- [x] Toast/status updates чрез подходящ live region.
- [ ] WCAG AA contrast.
- [x] `prefers-reduced-motion`.
- [ ] 200% zoom и reflow проверка.
- [ ] Screen-reader smoke test на search и booking funnel.

---

## 17. Responsive requirements

Да се проверят минимум следните viewport класове:

- 320–374 px: small mobile;
- 375–479 px: common mobile;
- 480–767 px: large mobile;
- 768–1023 px: tablet;
- 1024–1439 px: desktop;
- 1440 px+: wide desktop.

За всеки основен екран:

- [ ] Няма horizontal page overflow.
- [ ] Няма content зад bottom navigation или sticky CTA.
- [ ] Няма reliance on hover.
- [ ] Forms не стават прекалено широки на desktop.
- [ ] Results използват наличната ширина, без огромни празни полета.
- [ ] Bottom sheets се превръщат в dialog/side card, когато е по-подходящо.
- [ ] Mobile keyboard не скрива active field или CTA.

---

## 18. Performance и reliability

- [ ] Route-level code splitting, особено за club workspace и staff forms.
- [ ] Responsive images, lazy loading и explicit dimensions.
- [ ] Избягвай layout shift при изображения и loading states.
- [ ] Availability винаги остава network-fresh.
- [ ] Prefetch club details при реален navigation intent, без прекомерни заявки.
- [ ] Debounce само свободен текст; submit controls не трябва да се усещат бавни.
- [ ] Query keys включват всички search/availability параметри.
- [ ] Error telemetry преди production rollout.
- [ ] Добави retry rules, подходящи за reads и writes.
- [ ] Никога не retry-вай booking POST с риск от duplicate без idempotency strategy.

---

## 19. Testing и quality gates

### Automated

- [ ] Добави ESLint и formatting policy.
- [ ] Unit tests за search params parsing.
- [ ] Unit tests за slot selection и price total.
- [ ] Unit tests за booking intent persistence.
- [ ] Integration tests за auth return flow.
- [ ] E2E: signed-out booking.
- [ ] E2E: signed-in booking.
- [ ] E2E: booking conflict.
- [ ] E2E: cancel и reschedule.
- [ ] E2E: club lead form.
- [ ] Accessibility automation за core pages.
- [ ] Visual regression за основните responsive sizes.

### Manual UX checks

- [ ] Нов потребител намира slot без инструкция.
- [ ] Booking може да се завърши с една ръка на mobile.
- [ ] Няма загуба на state при login/back/refresh.
- [ ] Slow network и API error states са разбираеми.
- [ ] Bulgarian copy е естествен и consistent.
- [ ] Реален клуб може да разпознае и управлява operational задачите си.

### Definition of Done за всяка страница

- [ ] Default state.
- [ ] Loading state.
- [ ] Empty state.
- [ ] Error/retry state.
- [ ] Disabled и pending states.
- [ ] Mobile, tablet и desktop behavior.
- [ ] Keyboard behavior.
- [ ] BG и EN content.
- [ ] Light/dark, ако dark остава в release scope.
- [ ] Analytics events.
- [ ] Typecheck, tests и accessibility checks.

---

## 20. Analytics и success metrics

### Funnel events

- [ ] Search submitted.
- [ ] Results viewed.
- [ ] Club opened.
- [ ] Slot selected.
- [ ] Review opened.
- [ ] Auth started/completed.
- [ ] Booking confirm attempted.
- [ ] Booking completed/failed/conflicted.
- [ ] Booking cancelled/rescheduled.
- [ ] For Clubs CTA clicked.
- [ ] Lead submitted.

### Product metrics

- Search-to-slot-selection conversion.
- Slot-selection-to-booking conversion.
- Median time from landing to confirmed booking.
- Drop-off при auth и review.
- Booking conflict/error rate.
- Repeat booking rate.
- Club lead conversion rate.

Analytics не трябва да включва чувствителни personal или payment данни.

---

## 21. Препоръчан implementation order

### Milestone 0 — Contracts and decisions

- [ ] Потвърди reservation-only срещу online payment.
- [ ] Потвърди hold strategy.
- [ ] Потвърди aggregated search API.
- [ ] Потвърди новите club/reservation fields.
- [ ] Потвърди routing migration strategy.

### Milestone 1 — Foundations

- [x] Design tokens и shared primitives.
- [x] Player shell и navigation.
- [x] Accessibility foundations.
- [x] Component showcase.

### Milestone 2 — Discovery

- [x] Search landing.
- [x] URL search state.
- [x] Club results.
- [ ] Results filters и states.

### Milestone 3 — Availability

- [x] New club details layout.
- [x] Court-grouped availability.
- [x] Slot selection.
- [ ] Responsive booking summary.

### Milestone 4 — Booking

- [x] Booking intent persistence.
- [x] Review.
- [x] Auth return flow.
- [ ] Hold/confirm.
- [x] Confirmation page.

### Milestone 5 — Account

- [ ] My bookings.
- [ ] Booking details.
- [ ] Cancel/reschedule.
- [x] Account/settings.

### Milestone 6 — Clubs

- [ ] For Clubs landing.
- [ ] Lead form/success.
- [x] Separate club workspace.
- [x] Migrate existing staff tools.

### Milestone 7 — Hardening

- [ ] Accessibility audit.
- [ ] Responsive visual QA.
- [ ] Performance pass.
- [ ] Analytics.
- [ ] Tests, telemetry и production readiness.

---

## 22. Reuse map

### Запазваме

- feature-oriented layering;
- TanStack Query и query hooks;
- API client, JWT refresh и guards;
- demo data abstraction;
- i18n и formatting;
- club, court, price, opening-hours и auth business logic;
- reservation CRUD;
- contiguous slot selection и price calculation;
- PWA infrastructure;
- staff mutations.

### Преработваме визуално и композиционно

- AppShell/navigation;
- ClubsHero и ClubFilters;
- ClubCard;
- ClubHero;
- CourtCard/CourtHero;
- SlotGrid;
- BookingSummary;
- Reservations page/cards;
- Auth layout;
- Profile/Settings IA;
- Staff tools presentation.

### Добавяме

- Search domain и URL model;
- aggregated results UI;
- club-level availability;
- persistent BookingIntent;
- booking review;
- hold/checkout state;
- confirmation page;
- booking details page;
- For Clubs feature;
- dedicated club workspace shell;
- design-system foundations и accessibility behavior.

---

## 23. Финален release checklist

- [ ] Основният booking funnel е по-кратък от текущия.
- [ ] Club availability е достъпна без посещаване на отделна court detail page.
- [ ] Login не губи booking intent.
- [ ] Няма директен booking POST преди review/confirm.
- [ ] Има самостоятелна confirmation page.
- [ ] Player и staff navigation са ясно разделени.
- [ ] „За клубове“ има завършен lead flow.
- [ ] Дизайнът е проверен с реални BG данни, не само demo placeholders.
- [ ] Всички критични states са проектирани и тествани.
- [ ] Accessibility и responsive QA са завършени.
- [ ] API conflict и duplicate-submit сценарии са защитени.
- [ ] Build, tests и typecheck минават.
- [ ] Funnel analytics и error telemetry работят.

---

## 24. Северна звезда за всяко решение

Когато има спор между повече content, повече features или по-кратък flow, използваме следния въпрос:

> Помага ли това на играча да намери и резервира подходящ корт по-бързо и с повече увереност?

Ако отговорът е „не“, елементът не принадлежи в основния booking funnel.
