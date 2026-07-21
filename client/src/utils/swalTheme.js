import Swal from 'sweetalert2';

function getThemeValue(theme, path, fallback) {
    if (!theme || typeof theme !== 'object') {
        return fallback;
    }

    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), theme) ?? fallback;
}

function getSwalThemeConfig(theme) {
    const isDark = theme?.palette?.mode === 'dark';
    const paper = getThemeValue(theme, 'palette.background.paper', isDark ? '#1c0050' : '#ffffff');
    const textPrimary = getThemeValue(theme, 'palette.text.primary', isDark ? '#ffeefc' : '#1f2937');
    const textSecondary = getThemeValue(theme, 'palette.text.secondary', isDark ? '#d4b5ff' : '#6b7280');
    const divider = getThemeValue(theme, 'palette.divider', isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb');
    const primaryMain = getThemeValue(theme, 'palette.primary.main', isDark ? '#ff00ff' : '#a78bfa');
    const primaryDark = getThemeValue(theme, 'palette.primary.dark', isDark ? '#00ffff' : '#d63384');
    const successMain = getThemeValue(theme, 'palette.success.main', '#38c793');
    const warningMain = getThemeValue(theme, 'palette.warning.main', '#ffc55c');
    const errorMain = getThemeValue(theme, 'palette.error.main', '#ff5c6c');
    const grey100 = getThemeValue(theme, 'palette.grey.100', isDark ? 'rgba(255,255,255,.08)' : '#f3f4f6');

    const baseShadow = isDark
        ? '0 20px 60px rgba(0,0,0,.55)'
        : '0 20px 60px rgba(0,0,0,.18)';

    return {
        background: paper,
        color: textPrimary,
        titleColor: textPrimary,
        textColor: textSecondary,
        border: `1px solid ${divider}`,
        overlay: isDark ? 'rgba(0,0,0,.72)' : 'rgba(255,255,255,.55)',
        backdropFilter: 'blur(8px)',
        confirmBackground: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
        confirmColor: '#fff',
        cancelBackground: isDark ? 'rgba(255,255,255,.08)' : grey100,
        cancelBorder: `1px solid ${divider}`,
        cancelColor: textPrimary,
        confirmShadow: isDark ? '0 10px 25px rgba(0,0,0,.35)' : '0 10px 25px rgba(0,0,0,.18)',
        boxShadow: baseShadow,
        successColor: successMain,
        warningColor: warningMain,
        errorColor: errorMain,
    };
}

function applySwalThemeVariables(theme) {
    if (typeof document === 'undefined') {
        return;
    }

    const swalTheme = getSwalThemeConfig(theme);
    const root = document.documentElement;

    root.style.setProperty('--healing-swal-bg', swalTheme.background);
    root.style.setProperty('--healing-swal-text', swalTheme.color);
    root.style.setProperty('--healing-swal-title', swalTheme.titleColor);
    root.style.setProperty('--healing-swal-subtext', swalTheme.textColor);
    root.style.setProperty('--healing-swal-border', swalTheme.border);
    root.style.setProperty('--healing-swal-overlay', swalTheme.overlay);
    root.style.setProperty('--healing-swal-confirm-bg', swalTheme.confirmBackground);
    root.style.setProperty('--healing-swal-confirm-text', swalTheme.confirmColor);
    root.style.setProperty('--healing-swal-cancel-bg', swalTheme.cancelBackground);
    root.style.setProperty('--healing-swal-cancel-text', swalTheme.cancelColor);
    root.style.setProperty('--healing-swal-confirm-shadow', swalTheme.confirmShadow);
    root.style.setProperty('--healing-swal-shadow', swalTheme.boxShadow);
}

export function showThemeAlert(theme, {
    title,
    text,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    icon = 'warning',
    confirmColor,
    showCancelButton = true,
    showConfirmButton = true,
    showLoaderOnConfirm = false,
    customClass: customClassOverride,
    preConfirm: originalPreConfirm,
    ...rest
}) {
    const swalTheme = getSwalThemeConfig(theme);
    applySwalThemeVariables(theme);

    const didOpen = rest.didOpen;
    const mergedDidOpen = (popup) => {
        if (typeof didOpen === 'function') {
            didOpen(popup);
        }
    };

    const wrappedPreConfirm = originalPreConfirm
        ? async () => {
            try {
                return await originalPreConfirm();
            } catch (error) {
                Swal.hideLoading?.();
                const message = error?.message || 'Something went wrong. Please try again.';
                Swal.showValidationMessage(message);
                return false;
            }
        }
        : undefined;

    const mergedCustomClass = {
        popup: 'healing-swal-popup',
        confirmButton: 'healing-confirm-btn',
        cancelButton: 'healing-cancel-btn',
        ...customClassOverride,
    };

    return Swal.fire({
        title,
        text,
        icon,
        showCancelButton,
        showConfirmButton,
        showLoaderOnConfirm,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        buttonsStyling: false,
        reverseButtons: true,
        allowOutsideClick: () => true,
        allowEscapeKey: () => true,
        focusCancel: true,
        returnFocus: false,
        stopKeydownPropagation: false,
        showClass: {
            popup: 'animate__animated animate__zoomIn',
        },
        hideClass: {
            popup: 'animate__animated animate__zoomOut',
        },
        customClass: mergedCustomClass,
        didOpen: mergedDidOpen,
        background: swalTheme.background,
        color: swalTheme.color,
        confirmButtonColor: swalTheme.confirmBackground,
        cancelButtonColor: swalTheme.cancelBackground,
        ...rest,
        preConfirm: wrappedPreConfirm,
    });
}

export function showSuccessToast(theme, {
    title,
    text,
    icon = 'success',
    timer = 2000,
    position = 'top-end',
}) {
    const swalTheme = getSwalThemeConfig(theme);
    const toastDidOpen = (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    };

    applySwalThemeVariables(theme);

    return Swal.fire({
        toast: true,
        position,
        icon,
        title,
        text,
        showConfirmButton: false,
        showCancelButton: false,
        timer,
        timerProgressBar: true,
        didOpen: toastDidOpen,
        background: swalTheme.background,
        color: swalTheme.color,
        customClass: {
            popup: 'healing-swal-popup healing-swal-toast',
        },
    });
}

export const showConfirm = showThemeAlert;
