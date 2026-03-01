import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Contact, Evaluation } from '../types'

export type ContactWithScore = Contact & {
  latest_evaluation: Evaluation | null
}

interface UseContactsResult {
  contacts: ContactWithScore[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useContacts(): UseContactsResult {
  const [contacts, setContacts] = useState<ContactWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) {
        setContacts([])
        return
      }

      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (contactsError) throw contactsError

      const baseContacts = (contactsData ?? []) as Contact[]

      const withScores = await Promise.all(
        baseContacts.map(async (contact) => {
          const { data: evalData, error: evalError } = await supabase
            .from('evaluations')
            .select('*')
            .eq('evaluator_id', user.id)
            .eq('contact_id', contact.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (evalError) throw evalError

          return {
            ...contact,
            latest_evaluation: (evalData as Evaluation | null) ?? null,
          } satisfies ContactWithScore
        }),
      )

      setContacts(withScores)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load contacts'))
      setContacts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts().catch((err) => {
      setError(err instanceof Error ? err : new Error('Failed to load contacts'))
      setLoading(false)
    })
  }, [fetchContacts])

  const refetch = useCallback(() => {
    void fetchContacts()
  }, [fetchContacts])

  return { contacts, loading, error, refetch }
}
