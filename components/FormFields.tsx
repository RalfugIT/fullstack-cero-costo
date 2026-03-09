import { ChangeEvent } from 'react'

// Props para los componentes de campos/Input, con tipos específicos y sin any
interface FieldProps {
    label: string;
    name: string;
    type?: string;
    step?: string;
    value?: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
}

// Props para el componente de campos/InputSelect , con opciones definidas
interface SelectFieldProps {
    label: string;
    name: string;
    value?: string | number;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
}

// --- COMPONENTES ATÓMICOS CORREGIDOS (Sin any) ---

// Componente de campo genérico para el ingreso de datos tipeados, con props tipados y sin uso de any
export function Field({ label, name, type = "text", step, value, onChange, readOnly }: FieldProps) {
    const isDate = type === 'datetime-local' || type === 'date';
    return (
        <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-tighter">{label}</label>
            <input
                type={type} name={name} value={value ?? ""} onChange={onChange} readOnly={readOnly} step={step}
                className={`w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white${isDate ? '' : ' uppercase'}`}
            />
        </div>
    );
}

// Componente de campo genérico para el ingreso de datos enlistados, con props tipados y sin uso de any
export function SelectField({ label, name, value, onChange, options }: SelectFieldProps) {
    return (
        <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-tighter">{label}</label>
            <select
                name={name} value={value ?? ""} onChange={onChange}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white appearance-none uppercase"
            >
                <option value="">Seleccione...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}