import api from "@/lib/axios";
import { Reminder } from "@/types/reminder";

export const reminderService = {
  getTodaysReminders: async (patientId: string): Promise<Reminder[]> => {
    return await api.get<Reminder[]>(`/reminders/today/${patientId}`);
  },

  updateReminderStatus: async (reminderId: string, status: string): Promise<Reminder> => {
    return await api.put<Reminder>(`/reminders/${reminderId}/status?status=${status}`);
  }
};
