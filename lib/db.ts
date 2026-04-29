// lib/db.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export interface Listing {
  id: string;
  type?: 'worker' | 'employer'; // 'worker' = "mam czas", 'employer' = pracodawca szuka
  title?: string;
  description: string;
  phone: string;
  email: string;
  created_at: string;
  
  // Worker fields (mam czas)
  province?: string;
  city?: string;
  category?: string;
  availability_mode?: 'single' | 'range';
  available_date?: string;
  available_to?: string;
  available_hours?: string;
  rate_type?: 'hourly' | 'daily';
  rate?: string;
  
  // Employer fields (szukam ludzi)
  company_name?: string;
  job_title?: string;
  skills_required?: string;
  experience_level?: string;
  salary_min?: string;
  salary_max?: string;
}

// Demo mode: in-memory storage that persists for the dev server session
declare global {
  var demoListings: Listing[];
}

const caregivingLongDescription = 'Doświadczenie w opiece, chętny, odpowiedzialny, zarabiaj sobie. Mogę pomóc przy codziennych obowiązkach, zakupach, spacerach, podaniu leków i spokojnym towarzyszeniu w domu. Zależy mi na stałej, uczciwej współpracy i jasnych zasadach.';

if (!global.demoListings) {
  global.demoListings = [];
  
  // Dodaj wiele przykładowych pracowników do testowania
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);
  
  const demoWorkers: Listing[] = [
    // Transport
    { id: '1001', type: 'worker', title: 'Pomoc w przeprowadzce', description: 'Mogę pomóc w przeprowadzce mieszkania 2-pokojowego. Mam doświadczenie, nowy, solidny transport.', province: 'Mazowieckie', city: 'Warszawa', category: 'Transport', available_date: tomorrow.toISOString().split('T')[0], available_hours: '6', rate: '60', phone: '789456123', email: 'worker1@example.com', created_at: new Date().toISOString() },
    { id: '1002', type: 'worker', title: 'Transport paczek i mniejszych rzeczy', description: 'Mam małą dostawczaka. Mogę wozić paczki, mniejsze mebel, materiały budowlane.', province: 'Łódzkie', city: 'Łódź', category: 'Transport', available_date: tomorrow.toISOString().split('T')[0], available_hours: '5', rate: '65', phone: '777888999', email: 'worker4@example.com', created_at: new Date().toISOString() },
    { id: '1003', type: 'worker', title: 'Transport busem - przeprowadzki', description: 'Ekspress transport, solidny bus, szybka realizacja.', province: 'Wielkopolskie', city: 'Poznań', category: 'Transport', available_date: nextWeek.toISOString().split('T')[0], available_hours: '8', rate: '70', phone: '555123456', email: 'worker10@example.com', created_at: new Date().toISOString() },
    { id: '1004', type: 'worker', title: 'Transport - dostawa towarów', description: 'Dostawa towarów po mieście, szybko i bezpiecznie.', province: 'Śląskie', city: 'Katowice', category: 'Transport', available_date: in3Days.toISOString().split('T')[0], available_hours: '6', rate: '55', phone: '666777888', email: 'worker20@example.com', created_at: new Date().toISOString() },
    
    // Ogród
    { id: '1005', type: 'worker', title: 'Koszenie trawy, pielęgnacja ogrodu', description: 'Profesjonalne koszenie trawnika, przycinanie żywopłotów, sprzątanie liści.', province: 'Mazowieckie', city: 'Piaseczno', category: 'Ogród', available_date: tomorrow.toISOString().split('T')[0], available_hours: '4', rate: '50', phone: '654321987', email: 'worker2@example.com', created_at: new Date().toISOString() },
    { id: '1006', type: 'worker', title: 'Pielęgnacja ogrodów - usługi ogrodnicze', description: 'Pielęgnacja roślin, sadzenie, opielanie, profesjonalne narzędzia.', province: 'Małopolskie', city: 'Kraków', category: 'Ogród', available_date: nextWeek.toISOString().split('T')[0], available_hours: '5', rate: '55', phone: '111222333', email: 'worker7@example.com', created_at: new Date().toISOString() },
    { id: '1007', type: 'worker', title: 'Przycinanie żywopłotów i krzewów', description: 'Przycinanie, formowanie żywopłotów, utrzymanie ogrodów.', province: 'Dolnośląskie', city: 'Wrocław', category: 'Ogród', available_date: in3Days.toISOString().split('T')[0], available_hours: '4', rate: '50', phone: '333444555', email: 'worker15@example.com', created_at: new Date().toISOString() },
    
    // Budowa
    { id: '1008', type: 'worker', title: 'Malowanie ścian, drobne naprawy', description: 'Szukam zleceń na malowanie mieszkań, biur. Mam własne narzędzia i farby.', province: 'Mazowieckie', city: 'Warszawa', category: 'Budowa', available_date: nextWeek.toISOString().split('T')[0], available_hours: '8', rate: '75', phone: '555123456', email: 'worker3@example.com', created_at: new Date().toISOString() },
    { id: '1009', type: 'worker', title: 'Prace remontowe - wszystko od A do Z', description: 'Remonty mieszkań, pomalowanie, tapetowanie, montaż.', province: 'Wielkopolskie', city: 'Poznań', category: 'Budowa', available_date: tomorrow.toISOString().split('T')[0], available_hours: '8', rate: '80', phone: '888999111', email: 'worker11@example.com', created_at: new Date().toISOString() },
    { id: '1010', type: 'worker', title: 'Gipsowanie i wyrównywanie ścian', description: 'Profesjonalne gipsowanie, wyrównywanie ścian, przygotowanie do malowania.', province: 'Szczecin', city: 'Szczecin', category: 'Budowa', available_date: in3Days.toISOString().split('T')[0], available_hours: '7', rate: '70', phone: '444555666', email: 'worker16@example.com', created_at: new Date().toISOString() },
    { id: '1011', type: 'worker', title: 'Montaż terakoty i kafli', description: 'Montaż terakoty, kafli na ścianach i podłogach. Doświadczenie 10+ lat.', province: 'Łódzkie', city: 'Łódź', category: 'Budowa', available_date: nextWeek.toISOString().split('T')[0], available_hours: '6', rate: '85', phone: '777666555', email: 'worker18@example.com', created_at: new Date().toISOString() },
    
    // Magazyn
    { id: '1012', type: 'worker', title: 'Pracownik magazynowy - paczkownia', description: 'Szukam pracy tymczasowej w magazynie. Szybki, niezawodny, doświadczony.', province: 'Wielkopolskie', city: 'Poznań', category: 'Magazyn', available_date: nextWeek.toISOString().split('T')[0], available_hours: '8', rate: '55', phone: '222333444', email: 'worker6@example.com', created_at: new Date().toISOString() },
    { id: '1013', type: 'worker', title: 'Pakowanie i wysyłka - logistyka', description: 'Doświadczenie w magazynie, szybkie tempo pracy, systematyczny.', province: 'Mazowieckie', city: 'Piaseczno', category: 'Magazyn', available_date: tomorrow.toISOString().split('T')[0], available_hours: '8', rate: '50', phone: '999888777', email: 'worker12@example.com', created_at: new Date().toISOString() },
    { id: '1014', type: 'worker', title: 'Pracownik magazynu - kompletowanie zamówień', description: 'Szybkie kompletowanie zamówień, inwentaryzacja, transport wewnętrzny.', province: 'Śląskie', city: 'Kraków', category: 'Magazyn', available_date: in3Days.toISOString().split('T')[0], available_hours: '8', rate: '52', phone: '111555999', email: 'worker19@example.com', created_at: new Date().toISOString() },
    
    // Inne
    { id: '1015', type: 'worker', title: 'Sprzątanie biur i domów', description: 'Rzetelne sprzątanie mieszkań, biur, piwnic. Mam doświadczenie i referencje.', province: 'Mazowieckie', city: 'Warszawa', category: 'Inne', available_date: tomorrow.toISOString().split('T')[0], available_hours: '3', rate: '45', phone: '333444555', email: 'worker5@example.com', created_at: new Date().toISOString() },
    { id: '1016', type: 'worker', title: 'Opieka nad osobami starszymi', description: caregivingLongDescription, province: 'Mazowieckie', city: 'Warszawa', category: 'Inne', available_date: nextWeek.toISOString().split('T')[0], available_hours: '4', rate: '60', phone: '666888000', email: 'worker8@example.com', created_at: new Date().toISOString() },
    { id: '1017', type: 'worker', title: 'Udzielanie korepetycji - matematyka', description: 'Matematyka dla gimnazjalistów i licealistów. Doświadczenie z młodzieżą.', province: 'Łódzkie', city: 'Łódź', category: 'Inne', available_date: tomorrow.toISOString().split('T')[0], available_hours: '2', rate: '40', phone: '222111999', email: 'worker13@example.com', created_at: new Date().toISOString() },
    { id: '1018', type: 'worker', title: 'Sprzątanie po remontach', description: 'Ogólne i gruntowne sprzątanie pomieszczeń po pracach remontowych.', province: 'Wielkopolskie', city: 'Poznań', category: 'Inne', available_date: in3Days.toISOString().split('T')[0], available_hours: '5', rate: '48', phone: '888777666', email: 'worker14@example.com', created_at: new Date().toISOString() },
    { id: '1019', type: 'worker', title: 'Pomoc w przepisaniu tekstu - sekretariat', description: 'Szybkie pisanie, pisanie na maszynie nieduże teksty.', province: 'Śląskie', city: 'Katowice', category: 'Inne', available_date: nextWeek.toISOString().split('T')[0], available_hours: '3', rate: '35', phone: '666555444', email: 'worker17@example.com', created_at: new Date().toISOString() },
    { id: '1020', type: 'worker', title: 'Przepisanie nagrań tekstem', description: 'Transkrypcja nagrań, konwersja nagrań na tekst.', province: 'Dolnośląskie', city: 'Wrocław', category: 'Inne', available_date: tomorrow.toISOString().split('T')[0], available_hours: '4', rate: '45', phone: '999111777', email: 'worker21@example.com', created_at: new Date().toISOString() },
  ];
  
  global.demoListings = demoWorkers;
}

global.demoListings = global.demoListings.map((listing) => {
  if (listing.type === 'worker' && listing.title === 'Opieka nad osobami starszymi') {
    return {
      ...listing,
      description: caregivingLongDescription,
    };
  }

  return listing;
});

export async function createListing(data: Omit<Listing, 'id' | 'created_at'> & Record<string, any>) {
  if (supabase) {
    // Real database
    const { data: res, error } = await supabase
      .from('listings')
      .insert([data])
      .single();
    if (error) throw error;
    return res as Listing;
  } else {
    // Demo mode: store in global memory
    const listing: Listing = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    global.demoListings.unshift(listing);
    console.log(`📝 Demo: Created listing "${listing.title || listing.job_title}". Total: ${global.demoListings.length}`);
    return listing;
  }
}

export async function getListings(filters?: {
  type?: 'worker' | 'employer';
  province?: string;
  city?: string;
  category?: string;
  available_date?: string;
}): Promise<Listing[]> {
  if (supabase) {
    // Real database
    let query = supabase.from('listings').select('*');
    if (filters) {
      const { type, province, city, category, available_date } = filters;
      if (type) query = query.eq('type', type);
      if (province) query = query.eq('province', province);
      if (city) query = query.eq('city', city);
      if (category) query = query.eq('category', category);
      if (available_date) {
        query = query.or(`available_to.gte.${available_date},and(available_to.is.null,available_date.gte.${available_date})`);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Listing[];
  } else {
    // Demo mode: filter from global memory
    let results = [...global.demoListings];
    if (filters) {
      const { type, province, city, category, available_date } = filters;
      if (type) results = results.filter(l => l.type === type);
      if (province) results = results.filter(l => l.province === province);
      if (city) results = results.filter(l => l.city === city);
      if (category) results = results.filter(l => l.category === category);
      if (available_date) results = results.filter(l => {
        const listingEnd = l.available_to || l.available_date;
        return Boolean(listingEnd && listingEnd >= available_date);
      });
    }
    return results;
  }
}
