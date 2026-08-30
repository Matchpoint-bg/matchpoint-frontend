/**
 * Shared UI primitives. New code should import from this barrel rather than
 * reaching into the component folders.
 */

// Actions
export { Button, LinkButton, buttonClassName } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant, LinkButtonProps } from './Button';
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';

// Forms
export { Field } from './Field';
export type { FieldControlProps, FieldProps } from './Field';
export { Input, SearchInput, DateField, TimeField } from './Input';
export type {
  DateFieldProps,
  InputProps,
  InputSize,
  SearchInputProps,
  TimeFieldProps,
} from './Input';
export { Select } from './Select';
export type { SelectOption, SelectProps } from './Select';
export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

// Surfaces and layout
export { Card } from './Card';
export type { CardProps } from './Card';
export { Section } from './Section';
export type { SectionProps } from './Section';
export { SectionHeader } from './SectionHeader';
export { CardTitle } from './CardTitle';
export { Divider } from './Divider';
export { Toolbar, ToolbarSpacer } from './Toolbar';
export type { ToolbarProps } from './Toolbar';
export { Tabs } from './Tabs';
export type { TabItem, TabsProps } from './Tabs';

// Labels
export { Chip, ChipRow, FilterChip } from './Chip';
export type { ChipProps, ChipVariant } from './Chip';
export { Badge, StatusBadge, BookingStatus } from './Badge';
export type {
  BadgeProps,
  BadgeSize,
  BadgeTone,
  BookingStatusValue,
  StatusBadgeProps,
  StatusTone,
} from './Badge';
export { SurfaceBadge } from './SurfaceBadge';

// Display
export { Price } from './Price';
export type { PriceProps } from './Price';
export { DateTime } from './DateTime';
export type { DateTimeProps, DateTimeVariant } from './DateTime';

// Feedback and states
export { Spinner } from './Spinner';
export { Skeleton } from './Skeleton';
export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';
export { ErrorBoundary } from './ErrorBoundary';
export { ToastProvider, useToast } from './Toast';
export type { ToastKind } from './Toast';
export { ModalProvider, useModal } from './Modal';
export {
  Menu,
  MenuCheckbox,
  MenuItem,
  MenuLabel,
  MenuRadio,
  MenuRadioGroup,
  MenuSeparator,
} from './Menu';
export type { MenuCheckboxProps, MenuItemProps, MenuProps, MenuRadioProps } from './Menu';
export { useFocusTrap } from './Modal/useFocusTrap';
export { Sheet } from './Sheet';
export type { SheetPlacement, SheetProps } from './Sheet';

// Misc
export { Icon, Seam } from './Icon';
export type { IconName, IconProps } from './Icon';
export { ToggleRow } from './Toggle';
export { BackLink } from './BackLink';
