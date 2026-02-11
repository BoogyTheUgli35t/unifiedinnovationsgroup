import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export function useAuditLog() {
  const { session } = useAuth();

  const logAction = async ({
    actionType,
    targetType,
    targetId,
    reason,
    oldValue,
    newValue,
  }: {
    actionType: string;
    targetType: string;
    targetId?: string;
    reason: string;
    oldValue?: Json;
    newValue?: Json;
  }) => {
    if (!session?.user?.id) return;

    const { error } = await supabase.from('audit_logs').insert({
      actor_id: session.user.id,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      reason,
      old_value: oldValue,
      new_value: newValue,
    });

    if (error) console.error('Audit log error:', error);
  };

  return { logAction };
}
