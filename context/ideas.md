Предложен user flow

For Players → Filters → Clubs list → Club details → Choose date/time/court → Login → Booking summary → Confirm/Pay → Booking confirmation

И отделно:

For Clubs → Lead form → Submit → Success

ToDo / MVP backlog
Navigation
Logo / Home
For Players
For Clubs
Login
При logged-in user: My bookings + profile menu
Засега не бих слагал Clubs като отделен main-nav item, защото клубовете вече са част от For Players flow-а.
For Players — search page
Hero / кратък headline, примерно: „Намери тенис корт в София“
Search/filter bar:
City — засега Sofia
Sport — засега Tennis
Date — required
Time — optional
Primary CTA: Покажи клубове
Date:
не позволява минали дати
default може да е Today или празно
Search state да влиза в URL, например:
/players?city=sofia&sport=tennis&date=2026-08-30
Players — club results
Резултатите се появяват само след Search
Не бих показвал сложния schedule на този екран.
Всеки club row/card:
logo / image
club name
location
surface types
indoor / outdoor
approximate price from XX BGN
евентуално брой courts
Резервирай button
Може да прилича като структура на първата ти снимка, но по-модерно и с повече whitespace.
Резервирай не резервира веднага — отваря club details.
Club details page
Route:
/clubs/[slug]
Например:
/clubs/karamancheva
Header информация:
club name
gallery / main image
address
map
phone
surfaces
indoor/outdoor
facilities
description
Booking section да е основната част на страницата.
Search/filter controls:
Date
Surface — ако клубът има повече от една
Indoor / Outdoor — ако е приложимо
Duration — евентуално по-късно
Няма нужда пак да показваш City и Sport, защото вече сме вътре в конкретен tennis club.
Club availability
След избор на дата показваш:
Courts
Available times
Price
Може да използваш grid подобен на Click & Play, но не бих копирал директно тяхната голяма spreadsheet таблица.
За customer UX бих предпочел:
Court 1 → 16:00 | 17:00 | 19:00
Court 2 → 17:00 | 18:00 | 20:00
Free slots clickable.
Booked slots disabled.
Past slots disabled.
Ако денят е Today, 14:00 вече е минал → не може да се избере.
Ако е бъдеща дата → всички свободни slots са selectable.
Select booking slot
User избира например:
Tennis Club Karamancheva
Court 2
30 Aug
18:00–19:00
30 BGN
След click не бих го пращал директно към payment.

Първо:
Booking summary

Например:
Court 2
Sunday, 30 August
18:00–19:00
Clay
30 BGN

CTA:
Continue

Authentication gate
Точно тук проверяваш дали user е logged in.
Ако е:
→ продължава към checkout.
Ако не е:
→ Login / Register.
Важно: след login трябва да го върнеш към същата резервация, а не към homepage.
Тоест пазиш:
clubId
courtId
date
startTime
duration
Login / Registration
MVP:
email
password
name
phone
По-късно:
Google
Apple
След successful auth:
→ обратно към booking summary.
Temporary reservation / Hold
Много важна backend задача.
Когато user стигне до checkout:
Court 2 / 18:00 да се hold-не примерно за 10 минути.
Иначе двама души могат едновременно да резервират един slot.
Statuses:
AVAILABLE → HELD → BOOKED
Ако checkout не бъде завършен:
HELD → AVAILABLE
Checkout
Показваш отново:
club
court
date
time
price
User details.
Payment.
За MVP трябва да решиш един много важен business въпрос:
плащане през платформата или само reservation?
Ако първоначално клубовете искат плащане на място:
CTA може просто да бъде:
Потвърди резервацията
Това значително опростява първия MVP.
Online payment спокойно може да е Phase 2.
Booking confirmation
Success page:
Резервацията е потвърдена
Показва:
Club
Address
Court
Date
Time
Price
Booking number
Actions:
Add to calendar
Directions
My bookings
евентуално Cancel booking
My Bookings
Logged-in only.
Tabs:
Upcoming
Past
Booking card:
club
date
court
time
status
Actions:
View
Cancel
По-късно:
reschedule
repeat booking
invite player
Cancellation
Трябва да го мислиш още от MVP.
Всеки club евентуално може да има cancellation policy.
Пример:
Free cancellation until 12h before booking
Backend трябва да пази booking status:
confirmed
cancelled
completed
no-show
For Clubs page
Това не трябва засега да е registration за собственик.
По-добре sales / lead page:
„Имате тенис клуб? Присъединете се към MatchPoint.“
Обясняваш накратко benefits:
повече резервации
online schedule
по-малко телефонни обаждания
лесно управление на courts
CTA:
Искам да добавя клуба си
For Clubs — contact form
Fields:
Club name
City
Contact person
Email
Phone
Number of courts
Website / Facebook — optional
Message — optional
CTA:
Изпрати запитване
След submit:
Благодарим! Ще се свържем с вас.
Admin / club management — не е Player UI, но ще ти трябва
След като имаш истински клубове, някой трябва да управлява:
Courts
Opening hours
Prices
Availability
Blocked times
Bookings
За първото MVP дори ти можеш да бъдеш admin-а, вместо веднага да правиш сложен Club Owner Dashboard.
Това ще ти спести огромно количество работа.
Така бих орязал първата реална версия

Не бих започвал с payments, rankings, friends, coaches, tournaments и social функции.

Твоят MVP v1 е само:

FOR PLAYERS

Search
↓
Club list
↓
Club details
↓
Availability
↓
Choose court/time
↓
Login/Register
↓
Confirm reservation
↓
Success
↓
My bookings

FOR CLUBS

Landing page
↓
Contact form
↓
Lead sent

И вече имаш реално работещ продукт, който можеш да покажеш на тенис клубове.

И още едно UX решение: на club list бутона бих го кръстил „Виж свободни часове“, а не „Резервирай“. „Резервирай“ подсказва, че следващият click ще направи резервацията, а всъщност тепърва човекът ще избира корт и час. Виж свободни часове → избери slot → Резервирай е по-естественият flow.
