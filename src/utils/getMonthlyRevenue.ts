// utils/getMonthlyRevenue.ts

export interface MonthlyRevenue {
  month: string; // e.g., "2025-08"
  revenue: number; // total revenue for that month
}

export async function getMonthlyRevenue(
  branchId?: string
): Promise<MonthlyRevenue[]> {
  try {
    const url = branchId
      ? `/api/revenue/monthly?branchId=${branchId}`
      : `/api/revenue/monthly`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch monthly revenue: ${res.statusText}`);
    }

    const data: MonthlyRevenue[] = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return [];
  }
}
