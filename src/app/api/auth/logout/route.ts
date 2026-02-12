import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: { code: 'LOGOUT_FAILED', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
