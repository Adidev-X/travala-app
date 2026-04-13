// Sub-file re-exports
export { relativeDateLabel } from './formatDate';
// formatDate from ./formatDate is re-exported with a style-only signature alias:
export { formatDate as formatDateStyled } from './formatDate';
export { titleCase, truncateText } from './truncateText';
export { normalisePhone, validatePhone } from './validatePhone';

// Helpers (new comprehensive versions)
export {
    compressImage,
    formatCurrency,
    formatDate,
    formatPhone,
    getInitials,
    isExpiredDate,
    timeAgo
} from './helpers';

