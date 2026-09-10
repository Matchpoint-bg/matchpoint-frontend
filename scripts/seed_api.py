"""Seed the MatchPoint API with demo data so the front end has something to show.

Run inside the API container:

    docker compose -f docker-compose.stack.yml exec -T api \
        python manage.py shell < scripts/seed_api.py

It is idempotent — re-running updates the same rows instead of duplicating them.
Nothing here is imported by the API; it only uses the public models, so the
backend repository stays untouched.
"""

import datetime

from django.contrib.auth import get_user_model

from clubs.models import Club
from courts.models import Court
from openinghours.models import OpeningHours
from pricings.models import Prices

User = get_user_model()

WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

CLUBS = [
    {
        "name": "Lozenets Tennis Club",
        "address": "12 Zlatovrah St",
        "post_code": "1421",
        "latitude": 42.6743,
        "longitude": 23.3181,
        "description": "Six clay courts under floodlights, five minutes from Vitosha Blvd.",
        "website": "https://example.com/lozenets",
        "phone": "0888123456",
        "email": "hello@lozenets.example",
        "courts": [
            ("Clay 1", "Clay", False, True),
            ("Clay 2", "Clay", False, True),
            ("Indoor Hard 1", "Hard", True, True),
        ],
        "open": ("07:00", "22:00"),
        "peak_from": "17:00",
        "base_price": 8.0,
    },
    {
        "name": "Sofia Center Courts",
        "address": "5 Oborishte St",
        "post_code": "1504",
        "latitude": 42.6944,
        "longitude": 23.3419,
        "description": "Hard courts in the city centre, open year-round.",
        "website": "https://example.com/center",
        "phone": "0888654321",
        "email": "book@center.example",
        "courts": [
            ("Hard 1", "Hard", False, True),
            ("Hard 2", "Hard", False, False),
        ],
        "open": ("08:00", "21:00"),
        "peak_from": "18:00",
        "base_price": 10.0,
    },
    {
        "name": "Vitosha Grass & Clay",
        "address": "88 Simeonovsko Shose",
        "post_code": "1700",
        "latitude": 42.6501,
        "longitude": 23.3315,
        "description": "The only grass courts in Sofia, plus two covered clay courts.",
        "website": "https://example.com/vitosha",
        "phone": "0888777333",
        "email": "info@vitosha.example",
        "courts": [
            ("Grass 1", "Grass", False, False),
            ("Covered Clay 1", "Clay", True, True),
        ],
        "open": ("08:00", "20:00"),
        "peak_from": "17:00",
        "base_price": 12.0,
    },
]


def as_time(value):
    hour, minute = value.split(":")
    return datetime.time(int(hour), int(minute))


def price_rows(open_at, close_at, peak_from, base):
    """Off-peak and peak bands. The pricing lookup is `time_start <= slot < time_end`."""
    return [
        (as_time(open_at), as_time(peak_from), base),
        (as_time(peak_from), as_time(close_at), base + 4),
    ]


def upsert_staff(email, club):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={"first_name": "Club", "last_name": "Manager"},
    )
    if created:
        user.set_password("matchpoint")
        user.save()
    club.employees.add(user)
    return user


for spec in CLUBS:
    club, _ = Club.objects.update_or_create(
        name=spec["name"],
        defaults={
            "city": "Sofia",
            "address": spec["address"],
            "post_code": spec["post_code"],
            "latitude": spec["latitude"],
            "longitude": spec["longitude"],
            "description": spec["description"],
            "website": spec["website"],
            "phone": spec["phone"],
            "email": spec["email"],
        },
    )

    open_at, close_at = spec["open"]
    for weekday in WEEKDAYS:
        OpeningHours.objects.update_or_create(
            club=club,
            weekday=weekday,
            defaults={
                "opening_hour": as_time(open_at),
                "closing_hour": as_time(close_at),
            },
        )

    for name, surface, indoor, lit in spec["courts"]:
        court, _ = Court.objects.update_or_create(
            club_id=club,
            name=name,
            defaults={
                "sport_type": "Tennis",
                "surface_type": surface,
                "is_indoor": indoor,
                "is_lit": lit,
            },
        )
        for weekday in WEEKDAYS:
            for start, end, amount in price_rows(
                open_at, close_at, spec["peak_from"], spec["base_price"]
            ):
                Prices.objects.update_or_create(
                    court=court,
                    weekday=weekday,
                    time_start=start,
                    time_end=end,
                    defaults={"price_per_30_minutes": amount},
                )

    upsert_staff(f"staff@{club.email.split('@')[1]}", club)

player, created = User.objects.get_or_create(
    email="player@matchpoint.bg",
    defaults={
        "first_name": "Demo",
        "last_name": "Player",
        "phone_number": "0888000111",
        "preferred_language": "English",
    },
)
if created:
    player.set_password("matchpoint")
    player.save()

admin, created = User.objects.get_or_create(
    email="admin@matchpoint.bg",
    defaults={
        "first_name": "Site",
        "last_name": "Admin",
        "is_staff": True,
        "is_superuser": True,
    },
)
if created:
    admin.set_password("matchpoint")
    admin.save()

print(
    "Seeded {} clubs, {} courts, {} opening-hour rows, {} price rows.".format(
        Club.objects.count(),
        Court.objects.count(),
        OpeningHours.objects.count(),
        Prices.objects.count(),
    )
)
print("Logins (password 'matchpoint'): player@matchpoint.bg, admin@matchpoint.bg, "
      "staff@lozenets.example, staff@center.example, staff@vitosha.example")
