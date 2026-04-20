import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { CommunityForm } from '@/components/forms/community-form'
import { useAuth } from '@/hooks/use-auth'
import { createCommunity } from '@/services/communities'
import { queryKeys } from '@/services/query-keys'
import type { CommunityInput } from '@/types'

export default function CreateCommunityPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const createMutation = useMutation({
    mutationFn: (input: CommunityInput) => createCommunity(user!.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.communities.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.communities.managed(user!.id) })
      navigate('/app/manage')
    },
  })

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <div className="eyebrow">Create community</div>
        <h1 className="mt-3 text-5xl leading-none sm:text-6xl">Set up the community before you publish its events.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          Once your community exists, event creation works directly from the dashboard without any manual Supabase
          inserts.
        </p>
      </div>

      <CommunityForm
        submitLabel="Create community"
        isSubmitting={createMutation.isPending}
        onSubmit={async (input) => createMutation.mutateAsync(input)}
      />
    </div>
  )
}
