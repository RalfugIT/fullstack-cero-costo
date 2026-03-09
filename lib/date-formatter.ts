// --- HELPERS DE FECHA ---

// Convierte cualquier formato → "DD/MM/YYYY HH:MM" para mostrar en tabla/UI
// Soporta: ISO con/sin timezone (YYYY-MM-DDTHH:MM...) y ya formateado (DD/MM/YYYY HH:MM)

export function isoToDisplay(value: string): string {
    if (!value) return '';
    // Formato ISO: YYYY-MM-DDTHH:MM (con o sin timezone/segundos)
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]} ${isoMatch[4]}`;
    // Ya está en DD/MM/YYYY HH:MM → devolver tal cual (ignora segundos extras)
    const displayMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}:\d{2})/);
    if (displayMatch) return `${displayMatch[1]}/${displayMatch[2]}/${displayMatch[3]} ${displayMatch[4]}`;
    return value;
}

// Convierte cualquier formato → "YYYY-MM-DDTHH:MM" para el input datetime-local
// Soporta: ISO válido (pass-through), DD/MM/YYYY HH:MM (con o sin segundos)
export function displayToIso(value: string): string {
    if (!value) return '';
    // Ya es ISO (YYYY-MM-DDTHH:MM...) → recortar a 16 chars para datetime-local
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.substring(0, 16);
    // DD/MM/YYYY HH:MM ($ removido para tolerar ":SS" u otros extras al final)
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}:\d{2})/);
    if (!match) return '';
    return `${match[3]}-${match[2]}-${match[1]}T${match[4]}`;
}

// Formatea un objeto Date a "DD/MM/YYYY HH:MM" (tiempo local)
export function dateToDisplay(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${mi}`;
}