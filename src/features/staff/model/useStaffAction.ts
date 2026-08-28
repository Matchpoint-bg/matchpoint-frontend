import { useModal } from '../../../shared/ui/Modal';
import { useToast } from '../../../shared/ui/Toast';

export function useStaffAction(onDone: () => void = () => undefined) {
  const { closeModal } = useModal();
  const { toast } = useToast();

  const run = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      toast(successMessage, 'ok');
      closeModal();
      onDone();
    } catch (error) {
      toast(error instanceof Error ? error.message : String(error), 'err');
    }
  };

  return { run, closeModal };
}
