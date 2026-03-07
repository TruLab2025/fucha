// components/ContactModal.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Listing } from '../lib/db';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

type ContactInput = z.infer<typeof contactSchema>;

interface Props {
  listing: Listing;
  onClose: () => void;
}

export default function ContactModal({ listing, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    await fetch('/api/contact/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, listing }),
    });
    alert('Wiadomość wysłana');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block">Imię</label>
            <input {...register('name')} className="w-full border p-2" />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block">Email</label>
            <input type="email" {...register('email')} className="w-full border p-2" />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block">Telefon</label>
            <input {...register('phone')} className="w-full border p-2" />
          </div>
          <div>
            <label className="block">Wiadomość</label>
            <textarea {...register('message')} className="w-full border p-2" />
            {errors.message && <p className="text-red-500">{errors.message.message}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Anuluj
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
              Wyślij
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
