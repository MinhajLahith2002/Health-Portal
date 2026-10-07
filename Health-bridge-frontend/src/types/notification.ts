export type NotificationType = "SUPPORT_TICKET" | "SUPPORT_REPLY" | "GENERAL";

export interface AppNotification {
	id: string;
	title: string;
	message: string;
	type?: NotificationType | string;
	read: boolean;
	createdAt: string;
	link?: string;
	ticketId?: string;
}
