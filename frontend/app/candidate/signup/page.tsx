import { redirect } from 'next/navigation'

export default function CandidateSignupRedirect() {
  redirect('/login?next=/candidate/dashboard')
}
