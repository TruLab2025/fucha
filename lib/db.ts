// lib/db.ts
import { createClient } from '@supabase/supabase-js';
import { createPool, type Pool } from 'mysql2/promise';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export interface Listing {
  id: string;
  type?: 'worker' | 'employer';
  title?: string;
  description: string;
  created_at: string;
  expires_at?: string;
  status?: 'active' | 'expired' | 'deleted';

  province?: string;
  city?: string;
  category?: string;
  availability_mode?: 'single' | 'range';
  available_date?: string;
  available_to?: string;
  available_hours?: string;
  rate_type?: 'hourly' | 'daily';
  rate?: string;

  company_name?: string;
  job_title?: string;
  skills_required?: string;
  experience_level?: string;
  salary_min?: string;
  salary_max?: string;
}

export interface ListingContact {
  phone: string;
  email: string;
  contact_preference?: 'phone' | 'email' | 'both';
  verified_at?: string;
  consent_version?: string;
  consent_accepted_at?: string;
}

export type ListingRecord = Listing & ListingContact;
export type CreateListingInput = Omit<ListingRecord, 'id' | 'created_at'>;
export interface ListingFilters {
  type?: 'worker' | 'employer';
  province?: string;
  city?: string;
  category?: string;
  available_date?: string;
}

type StorageDriver = 'memory' | 'supabase' | 'mysql';

declare global {
  var demoListings: ListingRecord[];
  var mysqlPool: Pool | undefined;
}

const caregivingLongDescription = 'Doświadczenie w opiece, chętny, odpowiedzialny, zarabiaj sobie. Mogę pomóc przy codziennych obowiązkach, zakupach, spacerach, podaniu leków i spokojnym towarzyszeniu w domu. Zależy mi na stałej, uczciwej współpracy i jasnych zasadach.';

const normalizeDemoSeed = (listing: ListingRecord): ListingRecord => {
  if (listing.type === 'worker' && listing.title === 'Opieka nad osobami starszymi') {
    return {
      ...listing,
      description: caregivingLongDescription,
    };
  }

  return listing;
};

const defaultExpiresAt = () => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  return expirationDate.toISOString();
};

const sanitizeListing = ({ phone, email, contact_preference, verified_at, consent_version, consent_accepted_at, ...listing }: ListingRecord): Listing => listing;

const matchesFilters = (listing: ListingRecord, filters?: ListingFilters) => {
  if (!filters) {
    return true;
  }

  const { type, province, city, category, available_date } = filters;

  if (type && listing.type !== type) return false;
  if (province && listing.province !== province) return false;
  if (city && listing.city !== city) return false;
  if (category && listing.category !== category) return false;
  if (available_date) {
    const listingEnd = listing.available_to || listing.available_date;
    if (!listingEnd || listingEnd < available_date) return false;
  }

  if (listing.status && listing.status !== 'active') {
    return false;
  }

  if (listing.expires_at && listing.expires_at < new Date().toISOString()) {
    return false;
  }

  return true;
};

const configuredStorage = process.env.LISTINGS_STORAGE?.toLowerCase();
const hasMysqlConfig = Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);

const resolveStorageDriver = (): StorageDriver => {
  if (configuredStorage === 'mysql') return 'mysql';
  if (configuredStorage === 'supabase' && supabase) return 'supabase';
  if (configuredStorage === 'memory') return 'memory';
  if (hasMysqlConfig) return 'mysql';
  if (supabase) return 'supabase';
  return 'memory';
};

const storageDriver = resolveStorageDriver();

if (!global.demoListings) {
  const now = new Date().toISOString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);

  const demoListings = [
    { id: '1001', type: 'worker', title: 'Pomoc w przeprowadzce', description: 'Mogę pomóc w przeprowadzce mieszkania 2-pokojowego. Mam doświadczenie, nowy, solidny transport.', province: 'Mazowieckie', city: 'Warszawa', category: 'Transport', available_date: tomorrow.toISOString().split('T')[0], available_hours: '6', rate: '60', phone: '789456123', email: 'worker1@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1002', type: 'worker', title: 'Transport paczek i mniejszych rzeczy', description: 'Mam małą dostawczaka. Mogę wozić paczki, mniejsze mebel, materiały budowlane.', province: 'Łódzkie', city: 'Łódź', category: 'Transport', available_date: tomorrow.toISOString().split('T')[0], available_hours: '5', rate: '65', phone: '777888999', email: 'worker4@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1003', type: 'worker', title: 'Transport busem - przeprowadzki', description: 'Ekspress transport, solidny bus, szybka realizacja.', province: 'Wielkopolskie', city: 'Poznań', category: 'Transport', available_date: nextWeek.toISOString().split('T')[0], available_hours: '8', rate: '70', phone: '555123456', email: 'worker10@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1004', type: 'worker', title: 'Transport - dostawa towarów', description: 'Dostawa towarów po mieście, szybko i bezpiecznie.', province: 'Śląskie', city: 'Katowice', category: 'Transport', available_date: in3Days.toISOString().split('T')[0], available_hours: '6', rate: '55', phone: '666777888', email: 'worker20@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1005', type: 'worker', title: 'Koszenie trawy, pielęgnacja ogrodu', description: 'Profesjonalne koszenie trawnika, przycinanie żywopłotów, sprzątanie liści.', province: 'Mazowieckie', city: 'Piaseczno', category: 'Ogród', available_date: tomorrow.toISOString().split('T')[0], available_hours: '4', rate: '50', phone: '654321987', email: 'worker2@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1006', type: 'worker', title: 'Pielęgnacja ogrodów - usługi ogrodnicze', description: 'Pielęgnacja roślin, sadzenie, opielanie, profesjonalne narzędzia.', province: 'Małopolskie', city: 'Kraków', category: 'Ogród', available_date: nextWeek.toISOString().split('T')[0], available_hours: '5', rate: '55', phone: '111222333', email: 'worker7@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1007', type: 'worker', title: 'Przycinanie żywopłotów i krzewów', description: 'Przycinanie, formowanie żywopłotów, utrzymanie ogrodów.', province: 'Dolnośląskie', city: 'Wrocław', category: 'Ogród', available_date: in3Days.toISOString().split('T')[0], available_hours: '4', rate: '50', phone: '333444555', email: 'worker15@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1008', type: 'worker', title: 'Malowanie ścian, drobne naprawy', description: 'Szukam zleceń na malowanie mieszkań, biur. Mam własne narzędzia i farby.', province: 'Mazowieckie', city: 'Warszawa', category: 'Budowa', available_date: nextWeek.toISOString().split('T')[0], available_hours: '8', rate: '75', phone: '555123456', email: 'worker3@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1009', type: 'worker', title: 'Prace remontowe - wszystko od A do Z', description: 'Remonty mieszkań, pomalowanie, tapetowanie, montaż.', province: 'Wielkopolskie', city: 'Poznań', category: 'Budowa', available_date: tomorrow.toISOString().split('T')[0], available_hours: '8', rate: '80', phone: '888999111', email: 'worker11@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1010', type: 'worker', title: 'Gipsowanie i wyrównywanie ścian', description: 'Profesjonalne gipsowanie, wyrównywanie ścian, przygotowanie do malowania.', province: 'Szczecin', city: 'Szczecin', category: 'Budowa', available_date: in3Days.toISOString().split('T')[0], available_hours: '7', rate: '70', phone: '444555666', email: 'worker16@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1011', type: 'worker', title: 'Montaż terakoty i kafli', description: 'Montaż terakoty, kafli na ścianach i podłogach. Doświadczenie 10+ lat.', province: 'Łódzkie', city: 'Łódź', category: 'Budowa', available_date: nextWeek.toISOString().split('T')[0], available_hours: '6', rate: '85', phone: '777666555', email: 'worker18@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1012', type: 'worker', title: 'Pracownik magazynowy - paczkownia', description: 'Szukam pracy tymczasowej w magazynie. Szybki, niezawodny, doświadczony.', province: 'Wielkopolskie', city: 'Poznań', category: 'Magazyn', available_date: nextWeek.toISOString().split('T')[0], available_hours: '8', rate: '55', phone: '222333444', email: 'worker6@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1013', type: 'worker', title: 'Pakowanie i wysyłka - logistyka', description: 'Doświadczenie w magazynie, szybkie tempo pracy, systematyczny.', province: 'Mazowieckie', city: 'Piaseczno', category: 'Magazyn', available_date: tomorrow.toISOString().split('T')[0], available_hours: '8', rate: '50', phone: '999888777', email: 'worker12@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1014', type: 'worker', title: 'Pracownik magazynu - kompletowanie zamówień', description: 'Szybkie kompletowanie zamówień, inwentaryzacja, transport wewnętrzny.', province: 'Śląskie', city: 'Kraków', category: 'Magazyn', available_date: in3Days.toISOString().split('T')[0], available_hours: '8', rate: '52', phone: '111555999', email: 'worker19@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1015', type: 'worker', title: 'Sprzątanie biur i domów', description: 'Rzetelne sprzątanie mieszkań, biur, piwnic. Mam doświadczenie i referencje.', province: 'Mazowieckie', city: 'Warszawa', category: 'Inne', available_date: tomorrow.toISOString().split('T')[0], available_hours: '3', rate: '45', phone: '333444555', email: 'worker5@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1016', type: 'worker', title: 'Opieka nad osobami starszymi', description: caregivingLongDescription, province: 'Mazowieckie', city: 'Warszawa', category: 'Inne', available_date: nextWeek.toISOString().split('T')[0], available_hours: '4', rate: '60', phone: '666888000', email: 'worker8@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1017', type: 'worker', title: 'Udzielanie korepetycji - matematyka', description: 'Matematyka dla gimnazjalistów i licealistów. Doświadczenie z młodzieżą.', province: 'Łódzkie', city: 'Łódź', category: 'Inne', available_date: tomorrow.toISOString().split('T')[0], available_hours: '2', rate: '40', phone: '222111999', email: 'worker13@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1018', type: 'worker', title: 'Sprzątanie po remontach', description: 'Ogólne i gruntowne sprzątanie pomieszczeń po pracach remontowych.', province: 'Wielkopolskie', city: 'Poznań', category: 'Inne', available_date: in3Days.toISOString().split('T')[0], available_hours: '5', rate: '48', phone: '888777666', email: 'worker14@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1019', type: 'worker', title: 'Pomoc w przepisaniu tekstu - sekretariat', description: 'Szybkie pisanie, pisanie na maszynie nieduże teksty.', province: 'Śląskie', city: 'Katowice', category: 'Inne', available_date: nextWeek.toISOString().split('T')[0], available_hours: '3', rate: '35', phone: '666555444', email: 'worker17@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
    { id: '1020', type: 'worker', title: 'Przepisanie nagrań tekstem', description: 'Transkrypcja nagrań, konwersja nagrań na tekst.', province: 'Dolnośląskie', city: 'Wrocław', category: 'Inne', available_date: tomorrow.toISOString().split('T')[0], available_hours: '4', rate: '45', phone: '999111777', email: 'worker21@example.com', created_at: now, expires_at: defaultExpiresAt(), status: 'active' },
  ] satisfies ListingRecord[];

  global.demoListings = demoListings.map(normalizeDemoSeed);
}

global.demoListings = global.demoListings.map(normalizeDemoSeed);

const getMysqlPool = async () => {
  if (global.mysqlPool) {
    return global.mysqlPool;
  }

  global.mysqlPool = createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });

  return global.mysqlPool;
};

const createMemoryListing = async (data: CreateListingInput) => {
  const listing: ListingRecord = {
    ...data,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    expires_at: data.expires_at || defaultExpiresAt(),
    status: data.status || 'active',
  };

  global.demoListings.unshift(listing);
  console.log(`📝 Demo: Created listing "${listing.title || listing.job_title}". Total: ${global.demoListings.length}`);
  return sanitizeListing(listing);
};

const createSupabaseListing = async (data: CreateListingInput) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const payload = {
    type: data.type,
    title: data.title,
    description: data.description,
    phone: data.phone,
    email: data.email,
    province: data.province,
    city: data.city,
    category: data.category,
    availability_mode: data.availability_mode,
    available_date: data.available_date,
    available_to: data.available_to,
    available_hours: data.available_hours,
    rate_type: data.rate_type,
    rate: data.rate,
    company_name: data.company_name,
    job_title: data.job_title,
    skills_required: data.skills_required,
    experience_level: data.experience_level,
    salary_min: data.salary_min,
    salary_max: data.salary_max,
  };

  const { data: result, error } = await supabase
    .from('listings')
    .insert([payload])
    .select('*')
    .single();

  if (error) throw error;
  return sanitizeListing(result as ListingRecord);
};

const createMysqlListing = async (data: CreateListingInput) => {
  const pool = await getMysqlPool();
  const connection = await pool.getConnection();
  const listingId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = data.expires_at || defaultExpiresAt();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `INSERT INTO listings (
        id, type, title, description, created_at, expires_at, status,
        province, city, category, availability_mode, available_date, available_to,
        available_hours, rate_type, rate, company_name, job_title,
        skills_required, experience_level, salary_min, salary_max
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listingId,
        data.type || null,
        data.title || null,
        data.description,
        createdAt,
        expiresAt,
        data.status || 'active',
        data.province || null,
        data.city || null,
        data.category || null,
        data.availability_mode || null,
        data.available_date || null,
        data.available_to || null,
        data.available_hours || null,
        data.rate_type || null,
        data.rate || null,
        data.company_name || null,
        data.job_title || null,
        data.skills_required || null,
        data.experience_level || null,
        data.salary_min || null,
        data.salary_max || null,
      ]
    );

    await connection.execute(
      `INSERT INTO listing_contacts (
        listing_id, phone, email, contact_preference, verified_at, consent_version, consent_accepted_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listingId,
        data.phone,
        data.email,
        data.contact_preference || 'both',
        data.verified_at || null,
        data.consent_version || null,
        data.consent_accepted_at || null,
        createdAt,
      ]
    );

    await connection.commit();
    return {
      id: listingId,
      type: data.type,
      title: data.title,
      description: data.description,
      created_at: createdAt,
      expires_at: expiresAt,
      status: data.status || 'active',
      province: data.province,
      city: data.city,
      category: data.category,
      availability_mode: data.availability_mode,
      available_date: data.available_date,
      available_to: data.available_to,
      available_hours: data.available_hours,
      rate_type: data.rate_type,
      rate: data.rate,
      company_name: data.company_name,
      job_title: data.job_title,
      skills_required: data.skills_required,
      experience_level: data.experience_level,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
    } satisfies Listing;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getMemoryListings = async (filters?: ListingFilters) => global.demoListings.filter((listing) => matchesFilters(listing, filters)).map(sanitizeListing);

const getSupabaseListings = async (filters?: ListingFilters) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  let query = supabase.from('listings').select('*').order('created_at', { ascending: false });
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
  return ((data || []) as ListingRecord[]).map(sanitizeListing);
};

const getMysqlListings = async (filters?: ListingFilters) => {
  const pool = await getMysqlPool();
  const conditions = ['(status IS NULL OR status = ?)'];
  const values: Array<string> = ['active'];

  if (filters?.type) {
    conditions.push('type = ?');
    values.push(filters.type);
  }
  if (filters?.province) {
    conditions.push('province = ?');
    values.push(filters.province);
  }
  if (filters?.city) {
    conditions.push('city = ?');
    values.push(filters.city);
  }
  if (filters?.category) {
    conditions.push('category = ?');
    values.push(filters.category);
  }
  if (filters?.available_date) {
    conditions.push('(COALESCE(available_to, available_date) >= ?)');
    values.push(filters.available_date);
  }

  const [rows] = await pool.execute(
    `SELECT *
     FROM listings
     WHERE ${conditions.join(' AND ')}
       AND (expires_at IS NULL OR expires_at >= UTC_TIMESTAMP())
     ORDER BY created_at DESC`,
    values
  );

  return (rows as Listing[]);
};

const getMemoryListingRecord = async (listingId: string) => global.demoListings.find((listing) => listing.id === listingId) || null;

const getSupabaseListingRecord = async (listingId: string) => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .maybeSingle();

  if (error) throw error;
  return (data as ListingRecord | null) || null;
};

const getMysqlListingRecord = async (listingId: string) => {
  const pool = await getMysqlPool();
  const [rows] = await pool.execute(
    `SELECT l.*, c.phone, c.email, c.contact_preference, c.verified_at, c.consent_version, c.consent_accepted_at
     FROM listings l
     LEFT JOIN listing_contacts c ON c.listing_id = l.id
     WHERE l.id = ?
     LIMIT 1`,
    [listingId]
  );

  const [row] = rows as ListingRecord[];
  return row || null;
};

export async function createListing(data: CreateListingInput): Promise<Listing> {
  if (storageDriver === 'mysql') {
    return createMysqlListing(data);
  }

  if (storageDriver === 'supabase') {
    return createSupabaseListing(data);
  }

  return createMemoryListing(data);
}

export async function getListings(filters?: ListingFilters): Promise<Listing[]> {
  if (storageDriver === 'mysql') {
    return getMysqlListings(filters);
  }

  if (storageDriver === 'supabase') {
    return getSupabaseListings(filters);
  }

  return getMemoryListings(filters);
}

export async function getListingById(listingId: string): Promise<Listing | null> {
  const record = storageDriver === 'mysql'
    ? await getMysqlListingRecord(listingId)
    : storageDriver === 'supabase'
      ? await getSupabaseListingRecord(listingId)
      : await getMemoryListingRecord(listingId);

  return record ? sanitizeListing(record) : null;
}

export async function getListingContact(listingId: string): Promise<ListingContact | null> {
  const record = storageDriver === 'mysql'
    ? await getMysqlListingRecord(listingId)
    : storageDriver === 'supabase'
      ? await getSupabaseListingRecord(listingId)
      : await getMemoryListingRecord(listingId);

  if (!record) {
    return null;
  }

  return {
    phone: record.phone,
    email: record.email,
    contact_preference: record.contact_preference,
    verified_at: record.verified_at,
    consent_version: record.consent_version,
    consent_accepted_at: record.consent_accepted_at,
  };
}

export async function deleteExpiredListings(referenceDate = new Date()): Promise<number> {
  const isoReference = referenceDate.toISOString();

  if (storageDriver === 'mysql') {
    const pool = await getMysqlPool();
    const [contactsResult] = await pool.execute('DELETE c FROM listing_contacts c INNER JOIN listings l ON l.id = c.listing_id WHERE l.expires_at IS NOT NULL AND l.expires_at < ?', [isoReference]);
    const [listingsResult] = await pool.execute('DELETE FROM listings WHERE expires_at IS NOT NULL AND expires_at < ?', [isoReference]);
    const deletedListings = (listingsResult as { affectedRows?: number }).affectedRows || 0;
    const deletedContacts = (contactsResult as { affectedRows?: number }).affectedRows || 0;
    return deletedListings + deletedContacts;
  }

  if (storageDriver === 'supabase' && supabase) {
    const { data, error } = await supabase.from('listings').delete().lt('expires_at', isoReference).select('id');
    if (error) throw error;
    return data?.length || 0;
  }

  const initialCount = global.demoListings.length;
  global.demoListings = global.demoListings.filter((listing) => !listing.expires_at || listing.expires_at >= isoReference);
  return initialCount - global.demoListings.length;
}
