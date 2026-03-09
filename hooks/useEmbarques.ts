import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Embarque, EmbarqueForm } from '@/types/embarque';

export function useEmbarques() {
    const [datos, setDatos] = useState<Embarque[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Función para obtener datos de Supabase
    const fetchEmbarques = async () => {
        const { data, error } = await supabase
            .from('embarques')
            .select('*')
            .order('id_embarque', { ascending: false });

        if (error) {
            console.error('Error al obtener datos:', error.message);
        } else {
            setDatos(data || []);
        }
    };

    // 2. Efecto para carga inicial y Suscripción en Tiempo Real (Realtime)
    useEffect(() => {
        fetchEmbarques();

        const channel = supabase
            .channel('realtime-embarques')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'embarques' }, () => {
                fetchEmbarques();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // 3. Función para Guardar o Actualizar
    const guardarEmbarque = async (payload: any, editandoId: number | null) => {
        setLoading(true);
        const { error } = editandoId
            ? await supabase.from('embarques').update(payload).eq('id_embarque', editandoId)
            : await supabase.from('embarques').insert([payload]);
        setLoading(false);
        return { error };
    };

    // 4. Función para Eliminar
    const eliminarEmbarque = async (id: number) => {
        const { error } = await supabase.from('embarques').delete().eq('id_embarque', id);
        return { error };
    };

    // 5. Función para Planificar
    const planificarEmbarque = async (id: number) => {
        const { error } = await supabase.from('embarques').update({ planificado: true }).eq('id_embarque', id);
        return { error };
    };

    return {
        datos,
        loading,
        guardarEmbarque,
        eliminarEmbarque,
        planificarEmbarque
    };
}