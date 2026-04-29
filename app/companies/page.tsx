// app/companies/page.tsx
import { redirect } from 'next/navigation';

export default function CompaniesPage() {
  redirect('/companies/browse');
}
