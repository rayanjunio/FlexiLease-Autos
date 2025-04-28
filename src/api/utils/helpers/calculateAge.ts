export function calculateAge(date: Date): number {
    const now: Date = new Date();

    let age: number = now.getFullYear() - date.getFullYear();

    const monthsDiff: number = now.getMonth() - date.getMonth();

    if (monthsDiff < 0 || (monthsDiff === 0 && now.getDate() < date.getDate())) age--;
    
    return age;
}
