import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Contenedor, Corte } from '@/types/programacion';

export function useProgramacion(idEmbarque: number | null) {
    const [contenedores, setContenedores] = useState<Contenedor[]>([]);
    const [programacionCompleta, setProgramacionCompleta] = useState<any[]>([]);
    const [todosLosCortes, setTodosLosCortes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch para un embarque específico
    const fetchProgramacion = async () => {
        if (!idEmbarque) return;
        
        const { data: conts } = await supabase
            .from('contenedores')
            .select('*')
            .eq('foreign_id_embarque', idEmbarque)
            .order('id_contenedor', { ascending: true });

        setContenedores(conts || []);

        const { data: fullData, error } = await supabase
            .from('cortes')
            .select(`
                *,
                contenedores!inner (
                    *,
                    embarques!inner (*)
                )
            `)
            .eq('contenedores.foreign_id_embarque', idEmbarque)
            .order('id_corte', { ascending: false });

        if (error) {
            console.error('Error al obtener programación completa:', error.message);
        } else {
            setProgramacionCompleta(fullData || []);
        }
    };

    // Fetch para TODOS los cortes (listado general)
    const fetchTodosLosCortes = async () => {
        const { data, error } = await supabase
            .from('cortes')
            .select(`
                *,
                contenedores!inner (
                    *,
                    embarques!inner (booking, vessel, naviera, cliente)
                )
            `)
            .order('id_corte', { ascending: false });

        if (error) {
            console.error('Error al obtener todos los cortes:', error.message);
        } else {
            setTodosLosCortes(data || []);
        }
    };

    // Fetch inicial y suscripción realtime
    useEffect(() => {
        fetchTodosLosCortes();

        const channel = supabase
            .channel('realtime-all-cortes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contenedores' }, () => fetchTodosLosCortes())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cortes' }, () => fetchTodosLosCortes())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (idEmbarque) {
            fetchProgramacion();

            const channel = supabase
                .channel(`realtime-prog-${idEmbarque}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'contenedores' }, () => fetchProgramacion())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'cortes' }, () => fetchProgramacion())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [idEmbarque]);

    const guardarPlanificacion = async (contenedor: any, cortes: any[]) => {
        setLoading(true);
        try {
            const { data: contData, error: contError } = await supabase
                .from('contenedores')
                .insert([contenedor])
                .select()
                .single();

            if (contError) throw contError;

            const cortesConId = cortes.map(corte => ({
                ...corte,
                foreign_id_contenedor: contData.id_contenedor
            }));

            const { error: cortesError } = await supabase
                .from('cortes')
                .insert(cortesConId);

            if (cortesError) throw cortesError;

            return { error: null };
        } catch (error: any) {
            console.error('Error al guardar planificación:', error.message);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const eliminarCorte = async (idCorte: number) => {
        const { error } = await supabase.from('cortes').delete().eq('id_corte', idCorte);
        return { error };
    };

    return {
        contenedores,
        programacionCompleta,
        todosLosCortes,
        loading,
        guardarPlanificacion,
        eliminarCorte,
        refresh: fetchProgramacion,
        refreshAll: fetchTodosLosCortes
    };
}
