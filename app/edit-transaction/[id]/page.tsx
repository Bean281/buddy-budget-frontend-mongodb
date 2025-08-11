import { AddTransactionPage } from "@/components/add-transaction-page"

export default function EditTransaction({ params }: { params: { id: string } }) {
  return <AddTransactionPage transactionId={params.id} />
} 