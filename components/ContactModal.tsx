"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Listing } from '../lib/db';
import Icon from './Icon';

const contactSchema = z.object({
  name: z.string().min(1, { message: 'Podaj imię' }),
  email: z.string().email({ message: 'Podaj poprawny adres email' }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: 'Wiadomość musi mieć co najmniej 10 znaków' }),
});

type ContactInput = z.infer<typeof contactSchema>;

interface Props {
  listing: Listing;
  onClose: () => void;
}

export default function ContactModal({ listing, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (!firstElement || !lastElement) return;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onClose]);

  const onSubmit = async (data: ContactInput) => {
    setSubmitError(null);
    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: data.name,
          senderEmail: data.email,
          senderPhone: data.phone,
          message: data.message,
          targetListingId: listing.id,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setSubmitError(body?.error || 'Nie udało się wysłać wiadomości. Spróbuj ponownie.');
        return;
      }

      alert('Wiadomość wysłana');
      onClose();
    } catch {
      setSubmitError('Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-float max-h-[calc(100vh-2rem)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-neutral-50/80 p-5 sm:p-6">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <Icon name="phone" size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">Bezpośredni kontakt</p>
              <h2 id="contact-modal-title" className="mt-1 text-xl font-bold">Napisz w sprawie oferty</h2>
              <p className="mt-1 text-sm text-muted">{listing.job_title || listing.title}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-ink"
            aria-label="Zamknij okno kontaktu"
          >
            <Icon name="x" size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 sm:p-6">
          {submitError && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {submitError}
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="field-label">Imię</label>
              <input id="contact-name" autoComplete="name" {...register('name')} className={`w-full ${errors.name ? 'border-red-400' : ''}`} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
              {errors.name && <p id="contact-name-error" className="field-error">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="contact-phone" className="field-label">Telefon <span className="font-normal text-neutral-400">(opcjonalnie)</span></label>
              <input id="contact-phone" type="tel" autoComplete="tel" {...register('phone')} className="w-full" />
            </div>
          </div>
          <div>
            <label htmlFor="contact-email" className="field-label">Email</label>
            <input id="contact-email" type="email" autoComplete="email" {...register('email')} className={`w-full ${errors.email ? 'border-red-400' : ''}`} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
            {errors.email && <p id="contact-email-error" className="field-error">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="contact-message" className="field-label">Wiadomość</label>
            <textarea id="contact-message" rows={4} {...register('message')} className={`w-full ${errors.message ? 'border-red-400' : ''}`} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} placeholder="Napisz krótko, w jakiej sprawie się kontaktujesz..." />
            {errors.message && <p id="contact-message-error" className="field-error">{errors.message.message}</p>}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Anuluj</button>
            <button type="submit" disabled={isSubmitting} className="btn-green">
              {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              {!isSubmitting && <Icon name="arrow-right" size={17} />}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
