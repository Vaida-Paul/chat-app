export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarClass(name: string): string {
  const index = name.charCodeAt(0) % 9;
  return `av-${index}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
