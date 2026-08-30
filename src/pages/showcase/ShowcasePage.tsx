import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../../theme';
import {
  BackLink,
  Badge,
  BookingStatus,
  Button,
  Card,
  CardTitle,
  Chip,
  ChipRow,
  DateField,
  DateTime,
  Divider,
  EmptyState,
  ErrorState,
  Field,
  FilterChip,
  IconButton,
  Input,
  LinkButton,
  Menu,
  MenuCheckbox,
  MenuItem,
  MenuLabel,
  MenuRadio,
  MenuRadioGroup,
  MenuSeparator,
  Price,
  SearchInput,
  Section,
  Select,
  Sheet,
  Skeleton,
  Spinner,
  StatusBadge,
  SurfaceBadge,
  Tabs,
  Textarea,
  TimeField,
  ToggleRow,
  Toolbar,
  ToolbarSpacer,
} from '../../shared/ui';
import type {
  BadgeTone,
  BookingStatusValue,
  ButtonVariant,
  ChipVariant,
} from '../../shared/ui';
import styles from './ShowcasePage.module.css';

const BUTTON_VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'dark',
  'danger',
  'google',
];

const CHIP_VARIANTS: ChipVariant[] = ['default', 'ghost', 'clay', 'grass', 'hard', 'indoor', 'lit'];

const BADGE_TONES: BadgeTone[] = ['neutral', 'success', 'warning', 'danger', 'info', 'brand'];

const BOOKING_STATUSES: BookingStatusValue[] = [
  'confirmed',
  'pending',
  'cancelled',
  'completed',
  'no_show',
];

/** A fixed instant, so the DateTime examples don't drift between renders. */
const SAMPLE_START = '2026-05-14T18:00:00';
const SAMPLE_END = '2026-05-14T19:30:00';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      {children}
    </div>
  );
}

/**
 * Dev-only gallery of the shared UI primitives — registered in AppRouter behind
 * `import.meta.env.DEV`, so it is never part of a production build.
 */
export function ShowcasePage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Clay']);
  const [search, setSearch] = useState('Lokomotiv');
  const [tab, setTab] = useState('upcoming');
  const [segment, setSegment] = useState('day');
  const [toggled, setToggled] = useState(true);
  const [sheet, setSheet] = useState<'bottom' | 'side' | null>(null);
  const [menuSort, setMenuSort] = useState('price');
  const [menuFlag, setMenuFlag] = useState(true);

  const toggleFilter = (value: string) =>
    setSelectedFilters((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <h1>Design system showcase</h1>
        <Button variant="outline" size="sm" icon={theme === 'dark' ? 'sun' : 'moon'} onClick={toggleTheme}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>
      <p className={styles.intro}>
        Dev-only route. Every variant and state of the shared primitives, so regressions are visible
        in one place. Tab through to check focus rings.
      </p>

      <Section eyebrow="Primitives" title="Button">
        <Row label="variants (md)">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </Row>
        <Row label="size=sm">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="sm">
              {variant}
            </Button>
          ))}
        </Row>
        <Row label="with icon (start / end)">
          <Button icon="plus">Add court</Button>
          <Button variant="outline" icon="back" iconPosition="end">
            Next
          </Button>
        </Row>
        <Row label="loading (disabled + aria-busy)">
          <Button loading>Booking…</Button>
          <Button variant="outline" loading>
            Loading
          </Button>
          <Button variant="danger" size="sm" loading>
            Cancelling
          </Button>
        </Row>
        <Row label="disabled">
          <Button disabled>Primary</Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
        </Row>
        <Row label="block">
          <Button block>Full width</Button>
        </Row>
        <Row label="LinkButton (router / external)">
          <LinkButton to="/players" variant="secondary">
            To players
          </LinkButton>
          <LinkButton href="https://example.com" variant="outline" target="_blank" rel="noreferrer">
            External
          </LinkButton>
        </Row>
        <Row label="ghost (needs a dark backdrop)">
          <span style={{ display: 'inline-flex', gap: 10, padding: 12, borderRadius: 14, background: 'var(--court)' }}>
            <Button variant="ghost">ghost</Button>
            <Button variant="ghost" size="sm">
              ghost sm
            </Button>
          </span>
        </Row>
      </Section>

      <Divider />

      <Section eyebrow="Primitives" title="IconButton" sub="label is required and becomes aria-label">
        <Row label="variants">
          <IconButton icon="edit" label="Edit" />
          <IconButton icon="trash" label="Delete" variant="danger" />
          <IconButton icon="plus" label="Add" variant="primary" />
          <IconButton icon="gear" label="Settings" variant="secondary" />
          <IconButton icon="x" label="Close" variant="outline" size="sm" />
          <IconButton icon="check" label="Confirm" disabled />
        </Row>
      </Section>

      <Divider />

      <Section eyebrow="Primitives" title="Chip">
        <Row label="static variants">
          {CHIP_VARIANTS.map((variant) => (
            <Chip key={variant} variant={variant} icon="court">
              {variant}
            </Chip>
          ))}
        </Row>
        <Row label="FilterChip (toggle, aria-pressed)">
          {['Clay', 'Grass', 'Hard', 'Indoor'].map((value) => (
            <FilterChip
              key={value}
              selected={selectedFilters.includes(value)}
              onClick={() => toggleFilter(value)}
            >
              {value}
            </FilterChip>
          ))}
        </Row>
        <Row label="ChipRow">
          <ChipRow>
            <Chip variant="clay" icon="court">
              Clay
            </Chip>
            <Chip variant="indoor" icon="indoor">
              Indoor
            </Chip>
            <Chip variant="lit" icon="bulb">
              Floodlit
            </Chip>
          </ChipRow>
        </Row>
      </Section>

      <Divider />

      <Section eyebrow="Primitives" title="Card / Section / Divider">
        <div className={styles.swatchGrid}>
          <Card padded>
            <CardTitle icon="info">Static card</CardTitle>
            <p className="muted">padded, non-interactive.</p>
          </Card>
          <Card as="button" interactive padded onClick={() => undefined}>
            <CardTitle icon="ball">Interactive card</CardTitle>
            <p className="muted">Renders a real button; hover and focus lift.</p>
          </Card>
          <Card as="a" interactive padded href="#/players">
            <CardTitle icon="pin">Link card</CardTitle>
            <p className="muted">Renders an anchor.</p>
          </Card>
        </div>
      </Section>

      <Divider />

      <Section eyebrow="Primitives" title="Form controls" sub="Field owns the label, hint and error wiring">
        <div className={styles.formGrid}>
          <Field label="Club name" hint="Shown to players in search results.">
            {(control) => <Input {...control} placeholder="Lokomotiv Tennis" />}
          </Field>
          <Field label="Email" required error="Enter a valid email address">
            {(control) => <Input {...control} type="email" defaultValue="not-an-email" />}
          </Field>
          <Field label="City" note="required">
            {(control) => (
              <Select {...control} icon="pin" options={[{ value: 'sofia', label: 'Sofia' }]} />
            )}
          </Field>
          <Field label="City" error="Pick a supported city">
            {(control) => (
              <Select {...control} icon="pin" placeholder="Choose…" defaultValue="" options={[]} />
            )}
          </Field>
          <Field label="Date">
            {(control) => <DateField {...control} defaultValue="2026-05-14" />}
          </Field>
          <Field label="Time" note="optional">
            {(control) => <TimeField {...control} defaultValue="18:00" />}
          </Field>
          <Field label="Search" htmlFor="showcase-search">
            {(control) => (
              <SearchInput
                {...control}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch('')}
                clearLabel="Clear search"
                placeholder="Search clubs"
              />
            )}
          </Field>
          <Field label="Disabled">
            {(control) => <Input {...control} defaultValue="Read only" disabled />}
          </Field>
        </div>
        <Row label="Textarea (default / invalid)">
          <Textarea placeholder="Tell us about the club…" />
        </Row>
        <Field label="Message" error="This field is required">
          {(control) => <Textarea {...control} />}
        </Field>
        <Row label="row2 — the two-up field grid">
          <div className="row2" style={{ width: '100%' }}>
            <Field label="First name">{(control) => <Input {...control} />}</Field>
            <Field label="Last name">{(control) => <Input {...control} />}</Field>
          </div>
        </Row>
        <Row label="ToggleRow">
          <ToggleRow
            title="Dark mode"
            desc="Switch between light and dark appearance."
            checked={toggled}
            onChange={setToggled}
          />
        </Row>
      </Section>

      <Divider />

      <Section eyebrow="Labels" title="Badge / status / surface">
        <Row label="Badge tones (sm)">
          {BADGE_TONES.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </Row>
        <Row label="size=md, with icon">
          {BADGE_TONES.map((tone) => (
            <Badge key={tone} tone={tone} size="md" icon="check">
              {tone}
            </Badge>
          ))}
        </Row>
        <Row label="BookingStatus (tone + copy from one map)">
          {BOOKING_STATUSES.map((status) => (
            <BookingStatus key={status} status={status} />
          ))}
        </Row>
        <Row label="StatusBadge (caller supplies text and tone)">
          <StatusBadge label="Paid on site" tone="info" />
          <StatusBadge label="Awaiting payment" tone="warning" />
        </Row>
        <Row label="SurfaceBadge">
          <SurfaceBadge surface="Clay" />
          <SurfaceBadge surface="Grass" />
          <SurfaceBadge surface="Hard" />
          <SurfaceBadge surface="Padel" />
        </Row>
      </Section>

      <Divider />

      <Section eyebrow="Display" title="Price / DateTime">
        <Row label="Price">
          <Price value={24} />
          <Price value={24} from />
          <Price value={137.5} size="lg" />
        </Row>
        <Row label="DateTime (renders a semantic <time>)">
          <DateTime value={SAMPLE_START} />
          <DateTime value={SAMPLE_START} end={SAMPLE_END} />
          <DateTime value={SAMPLE_START} variant="date" />
          <DateTime value={SAMPLE_START} variant="weekday" />
          <DateTime value={SAMPLE_START} variant="dateLong" />
        </Row>
      </Section>

      <Divider />

      <Section eyebrow="Layout" title="Toolbar / Tabs" sub="Arrow keys, Home and End move between tabs">
        <Row label="Tabs (underline)">
          <div style={{ width: '100%' }}>
            <Tabs
              label="Bookings"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past' },
                { value: 'cancelled', label: 'Cancelled', disabled: true },
              ]}
            />
          </div>
        </Row>
        <Row label="Tabs (segmented)">
          <div style={{ width: '100%', maxWidth: 320 }}>
            <Tabs
              variant="segmented"
              label="Schedule view"
              value={segment}
              onChange={setSegment}
              items={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
              ]}
            />
          </div>
        </Row>
        <Row label="Toolbar (align=between)">
          <Toolbar align="between" aria-label="Results" style={{ width: '100%' }}>
            <span className="muted">12 clubs in Sofia</span>
            <Button variant="outline" size="sm" icon="gear">
              Filters
            </Button>
          </Toolbar>
        </Row>
        <Row label="Toolbar with ToolbarSpacer">
          <Toolbar wrap={false} style={{ width: '100%' }}>
            <Chip variant="clay">Clay</Chip>
            <ToolbarSpacer />
            <Button variant="secondary" size="sm">
              Sort
            </Button>
          </Toolbar>
        </Row>
        <Row label="BackLink">
          <BackLink label="All clubs" onClick={() => undefined} />
        </Row>
      </Section>

      <Divider />

      <Section
        eyebrow="Overlays"
        title="Menu"
        sub="ARIA menu button — ArrowDown opens, arrows wrap, Escape returns focus to the trigger"
      >
        <Row label="Menu with items, radios and a checkbox">
          <Menu
            label="Demo menu"
            align="start"
            trigger={(props) => (
              <Button {...props} variant="outline" icon="chevronDown" iconPosition="end">
                Open menu
              </Button>
            )}
          >
            <MenuLabel>
              Signed in as
              <strong>player@matchpoint.bg</strong>
            </MenuLabel>
            <MenuItem icon="user" onClick={() => undefined}>
              Profile
            </MenuItem>
            <MenuItem icon="ticket" onClick={() => undefined} hint="3">
              Bookings
            </MenuItem>
            <MenuSeparator />
            <MenuRadioGroup label="Sort by">
              <MenuRadio checked={menuSort === 'price'} onSelect={() => setMenuSort('price')}>
                Price
              </MenuRadio>
              <MenuRadio checked={menuSort === 'distance'} onSelect={() => setMenuSort('distance')}>
                Distance
              </MenuRadio>
            </MenuRadioGroup>
            <MenuCheckbox icon="bell" checked={menuFlag} onChange={setMenuFlag}>
              Notifications
            </MenuCheckbox>
            <MenuSeparator />
            <MenuItem icon="logout" danger onClick={() => undefined}>
              Sign out
            </MenuItem>
          </Menu>
          <span className="muted">
            sort: {menuSort} · notifications: {menuFlag ? 'on' : 'off'}
          </span>
        </Row>
        <Row label="disabled item">
          <Menu
            label="Actions"
            align="start"
            trigger={(props) => (
              <Button {...props} variant="secondary" size="sm">
                Actions
              </Button>
            )}
          >
            <MenuItem icon="edit" onClick={() => undefined}>
              Edit
            </MenuItem>
            <MenuItem icon="trash" danger disabled onClick={() => undefined}>
              Delete
            </MenuItem>
          </Menu>
        </Row>
      </Section>

      <Divider />

      <Section
        eyebrow="Overlays"
        title="Sheet"
        sub="Bottom sheet on mobile; centred dialog or docked side panel from 640px"
      >
        <Row label="placement (Escape closes, focus returns to the trigger)">
          <Button variant="outline" onClick={() => setSheet('bottom')}>
            Open bottom sheet
          </Button>
          <Button variant="outline" onClick={() => setSheet('side')}>
            Open side panel
          </Button>
        </Row>
        <Sheet
          open={sheet !== null}
          onClose={() => setSheet(null)}
          placement={sheet ?? 'bottom'}
          title={sheet === 'side' ? 'Booking summary' : 'Filter results'}
          footer={
            <Button block onClick={() => setSheet(null)}>
              Confirm
            </Button>
          }
        >
          <p className="muted">
            The body scrolls; the footer stays pinned. Resize past 640px to see the placement
            change.
          </p>
          <ChipRow role="group" aria-label="Surface">
            {['Clay', 'Grass', 'Hard'].map((value) => (
              <FilterChip
                key={value}
                selected={selectedFilters.includes(value)}
                onClick={() => toggleFilter(value)}
              >
                {value}
              </FilterChip>
            ))}
          </ChipRow>
          <Field label="Date">{(control) => <DateField {...control} />}</Field>
        </Sheet>
      </Section>

      <Divider />

      <Section eyebrow="States" title="Feedback">
        <div className={styles.stack}>
          <Card padded>
            <Skeleton height={18} count={3} />
          </Card>
          <Card padded>
            <Spinner />
          </Card>
          <Card padded>
            <EmptyState title="No results" desc="Try another date or city." />
          </Card>
          <Card padded>
            <ErrorState msg="Network request failed" onRetry={() => undefined} />
          </Card>
        </div>
      </Section>
    </main>
  );
}
