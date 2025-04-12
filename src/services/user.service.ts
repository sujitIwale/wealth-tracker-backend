import prisma from "../prisma"

export const userService = {
    markTransactionAdded: async (userId: string) => {
        await prisma.user.update({
            where: { id: userId },
            data: { addedTransaction: true }
        })
    }
}