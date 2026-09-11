export interface TeamMember {
  name: string;
  email: string;
  role: string;
  clients: number;
}

export const teamMembers: TeamMember[] = [
  { name: "Андрей К.", email: "andrey@saas.ru", role: "Владелец", clients: 4 },
  { name: "Мария С.", email: "maria@saas.ru", role: "Менеджер", clients: 4 },
  { name: "Дмитрий Л.", email: "dmitry@saas.ru", role: "Инженер", clients: 3 },
];
