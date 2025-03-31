import prisma from "../prisma";

const incomeService = {
  getTotalIncomes: async ({
    userId,
    all,
    from,
    to,
    giveSum,
    limit,
    order,
  }: {
    userId: string;
    limit?: number;
    order?: "asc" | "desc";
    all?: boolean;
    from?: Date;
    to?: Date;
    giveSum?: string;
  }) => {
    let sum = 0
    if (all) {
      from = new Date("0001-01-01");
      to = new Date();
    }
    if (giveSum === "true") {
      const result = await prisma.income.aggregate({
        where: {
          userId,
          createdAt: {
            gte: from,
            lte: to,
          },
        },
        orderBy: {
          createdAt: order,
        },
        take: limit,
        _sum: {
          amount: true,
        },
      });
      sum = result._sum.amount || 0;
    }
    
    return {
      incomes: await prisma.income.findMany({
        where: {
          userId,
          createdAt: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        createdAt: order,
      },
      take: limit,
    }),
      sum,
    };
  },
};

export default incomeService;
