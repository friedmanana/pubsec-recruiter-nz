import { redirect } from 'next/navigation'

export default function HiringLoginRedirect() {
  redirect('/login?next=/jobs/new')
}
