import { EditGoalForm } from "@/components/edit-goal-form"

export default async function EditGoal({ params }: { params: { id: string } }) {
  const id = await Promise.resolve(params.id)
  return <EditGoalForm goalId={id} />
} 